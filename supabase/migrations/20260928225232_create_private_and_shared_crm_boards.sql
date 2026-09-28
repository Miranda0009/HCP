create table public.crm_boards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 70),
  template text not null default 'custom' check (template in ('sales','success','recruitment','custom')),
  visibility text not null default 'private' check (visibility in ('private','team')),
  stages jsonb not null check (jsonb_typeof(stages) = 'array' and jsonb_array_length(stages) between 1 and 30),
  cards jsonb not null default '[]'::jsonb check (jsonb_typeof(cards) = 'array' and jsonb_array_length(cards) <= 500),
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint crm_boards_payload_limit check (octet_length(stages::text) + octet_length(cards::text) <= 1048576)
);
create index crm_boards_account_visibility_idx on public.crm_boards(account_id, visibility, created_at);
create index crm_boards_owner_idx on public.crm_boards(owner_user_id, account_id);

create or replace function private.prepare_crm_board()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id or new.account_id is distinct from old.account_id
       or new.owner_user_id is distinct from old.owner_user_id then
      raise exception 'crm_identity_immutable';
    end if;
    if new.visibility is distinct from old.visibility and old.owner_user_id <> (select auth.uid()) then
      raise exception 'crm_visibility_owner_only';
    end if;
    new.revision := old.revision + 1;
  else
    new.revision := 1;
  end if;
  new.updated_by := (select auth.uid());
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.prepare_crm_board() from public, anon, authenticated;
create trigger prepare_crm_board_before_write
before insert or update on public.crm_boards
for each row execute function private.prepare_crm_board();

alter table public.crm_boards enable row level security;
revoke all on table public.crm_boards from public, anon, authenticated;
grant select, delete on table public.crm_boards to authenticated;
grant insert (account_id, owner_user_id, name, template, visibility, stages, cards) on public.crm_boards to authenticated;
grant update (name, template, visibility, stages, cards) on public.crm_boards to authenticated;

create policy crm_boards_select on public.crm_boards for select to authenticated
using ((select private.is_account_member(account_id)) and
       (owner_user_id = (select auth.uid()) or visibility = 'team'));
create policy crm_boards_insert on public.crm_boards for insert to authenticated
with check ((select private.is_account_member(account_id)) and owner_user_id = (select auth.uid()) and visibility = 'private');
create policy crm_boards_update on public.crm_boards for update to authenticated
using ((select private.is_account_member(account_id)) and
       (owner_user_id = (select auth.uid()) or visibility = 'team'))
with check ((select private.is_account_member(account_id)) and
            (owner_user_id = (select auth.uid()) or visibility = 'team'));
create policy crm_boards_delete on public.crm_boards for delete to authenticated
using ((select private.is_account_member(account_id)) and owner_user_id = (select auth.uid()));

create table public.account_invitations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email text not null check (length(email) between 3 and 320 and email = lower(btrim(email))),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  unique(account_id, email)
);
create index account_invitations_email_idx on public.account_invitations(email, expires_at);
alter table public.account_invitations enable row level security;
revoke all on table public.account_invitations from public, anon, authenticated;
grant select on table public.account_invitations to authenticated;
create policy account_invitations_select on public.account_invitations for select to authenticated
using (
  (select auth.uid()) is not null and (
    lower(email) = lower((select auth.jwt() ->> 'email'))
    or exists (
      select 1 from public.account_memberships m
      where m.account_id = account_invitations.account_id
        and m.user_id = (select auth.uid()) and m.role in ('owner','admin')
    )
  )
);

create or replace function public.hcp_create_account_invitation(p_account_id uuid, p_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := (select auth.uid());
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_target uuid;
  v_invitation uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if length(v_email) not between 3 and 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_email';
  end if;
  if not exists (
    select 1 from public.account_memberships m
    where m.account_id = p_account_id and m.user_id = v_user_id and m.role in ('owner','admin')
  ) then raise exception 'account_admin_required'; end if;
  select u.id into v_target from auth.users u where lower(u.email) = v_email limit 1;
  if v_target is not null and exists (
    select 1 from public.account_memberships m where m.account_id = p_account_id and m.user_id = v_target
  ) then raise exception 'already_member'; end if;
  insert into public.account_invitations(account_id, email, created_by)
  values (p_account_id, v_email, v_user_id)
  on conflict (account_id, email) do update
    set created_by = excluded.created_by, created_at = now(),
        expires_at = now() + interval '14 days', accepted_at = null, accepted_by = null
  returning id into v_invitation;
  return v_invitation;
end;
$$;
revoke all on function public.hcp_create_account_invitation(uuid,text) from public, anon, authenticated;
grant execute on function public.hcp_create_account_invitation(uuid,text) to authenticated;

create or replace function public.hcp_accept_account_invitation(p_invitation_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := (select auth.uid());
  v_email text;
  v_invitation public.account_invitations%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  select lower(u.email) into v_email from auth.users u
  where u.id = v_user_id and u.email_confirmed_at is not null;
  if v_email is null then raise exception 'verified_email_required'; end if;
  select * into v_invitation from public.account_invitations i
  where i.id = p_invitation_id for update;
  if not found or v_invitation.accepted_at is not null
     or v_invitation.expires_at <= now() or v_invitation.email <> v_email then
    raise exception 'invitation_unavailable';
  end if;
  insert into public.account_memberships(account_id, user_id, role)
  values(v_invitation.account_id, v_user_id, 'member')
  on conflict(account_id,user_id) do nothing;
  update public.account_invitations set accepted_at = now(), accepted_by = v_user_id
  where id = p_invitation_id;
  return v_invitation.account_id;
end;
$$;
revoke all on function public.hcp_accept_account_invitation(uuid) from public, anon, authenticated;
grant execute on function public.hcp_accept_account_invitation(uuid) to authenticated;
