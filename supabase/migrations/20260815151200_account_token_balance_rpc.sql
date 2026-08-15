-- HCP: leitura agregada e segura do saldo da conta principal do usuário.

create or replace function public.hcp_get_token_balance()
returns table (
  account_id uuid,
  token_balance bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  select memberships.account_id
    into v_account_id
  from public.account_memberships as memberships
  where memberships.user_id = v_user_id
  order by
    case memberships.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    memberships.created_at,
    memberships.account_id
  limit 1;

  if v_account_id is null then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  account_id := v_account_id;
  select coalesce(sum(ledger.amount), 0)::bigint
    into token_balance
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id;
  return next;
end;
$$;

comment on function public.hcp_get_token_balance() is
  'Retorna o saldo agregado da conta HCP prioritária do usuário autenticado sem paginação do razão.';

revoke all on function public.hcp_get_token_balance()
  from public, anon, authenticated, service_role;
grant execute on function public.hcp_get_token_balance()
  to authenticated;
