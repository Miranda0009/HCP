-- Identificador público opcional para convites dentro do HCP.
alter table public.profiles add column username text;
alter table public.profiles add constraint profiles_username_format
  check (username is null or (
    username ~ '^[a-z][a-z0-9_]{2,29}$'
    and username not in ('admin', 'hcp', 'root', 'suporte', 'support', 'system')
  ));
create unique index profiles_username_unique on public.profiles (lower(username))
  where username is not null;

-- Não expõe e-mails nem permite busca geral de perfis. Só um administrador
-- da empresa pode convidar pelo @usuário exato.
create or replace function public.hcp_create_account_invitation_by_username(
  p_account_id uuid, p_username text
)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := (select auth.uid());
  v_username text := lower(btrim(coalesce(p_username, '')));
  v_target_id uuid;
  v_target_email text;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not exists (
    select 1 from public.account_memberships m
    where m.account_id = p_account_id and m.user_id = v_user_id
      and m.role in ('owner', 'admin')
  ) then raise exception 'account_admin_required'; end if;
  if v_username !~ '^[a-z][a-z0-9_]{2,29}$' then
    raise exception 'invalid_hcp_username';
  end if;
  select p.id, u.email into v_target_id, v_target_email
    from public.profiles p join auth.users u on u.id = p.id
    where p.username = v_username and u.email_confirmed_at is not null;
  if v_target_id is null then raise exception 'hcp_user_not_found'; end if;
  if v_target_id = v_user_id then raise exception 'cannot_invite_self'; end if;
  perform public.hcp_create_account_invitation(p_account_id, v_target_email);
  return v_username;
end;
$$;
revoke all on function public.hcp_create_account_invitation_by_username(uuid,text)
  from public, anon, authenticated;
grant execute on function public.hcp_create_account_invitation_by_username(uuid,text)
  to authenticated;
