-- HCP: saldo inicial idempotente e consumo transacional de créditos de leads.
-- Migração aditiva: preserva todo o histórico existente do token_ledger.

alter table public.token_ledger
  add column if not exists reference_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'token_ledger_reference_key_valid'
      and conrelid = 'public.token_ledger'::regclass
  ) then
    alter table public.token_ledger
      add constraint token_ledger_reference_key_valid
      check (
        reference_key is null
        or (
          reference_key = btrim(reference_key)
          and length(reference_key) between 3 and 120
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'token_ledger_account_reference_key_unique'
      and conrelid = 'public.token_ledger'::regclass
  ) then
    alter table public.token_ledger
      add constraint token_ledger_account_reference_key_unique
      unique (account_id, reference_key);
  end if;
end;
$$;

comment on column public.token_ledger.reference_key is
  'Chave idempotente única por conta para créditos e débitos originados por uma operação externa.';

create or replace function private.grant_initial_account_credits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.token_ledger (
    account_id,
    user_id,
    amount,
    transaction_type,
    reference_key,
    created_at
  )
  values (
    new.id,
    new.owner_user_id,
    1000,
    'manual_adjustment',
    'initial_balance_v1',
    timezone('utc', now())
  )
  on conflict on constraint token_ledger_account_reference_key_unique do nothing;

  return new;
end;
$$;

revoke all on function private.grant_initial_account_credits()
  from public, anon, authenticated, service_role;

drop trigger if exists grant_initial_account_credits on public.accounts;
create trigger grant_initial_account_credits
  after insert on public.accounts
  for each row execute procedure private.grant_initial_account_credits();

-- Contas já existentes recebem o mesmo lançamento, sem duplicar em reexecuções.
insert into public.token_ledger (
  account_id,
  user_id,
  amount,
  transaction_type,
  reference_key,
  created_at
)
select
  accounts.id,
  accounts.owner_user_id,
  1000,
  'manual_adjustment',
  'initial_balance_v1',
  timezone('utc', now())
from public.accounts as accounts
on conflict on constraint token_ledger_account_reference_key_unique do nothing;

create or replace function public.hcp_consume_lead_credits(
  p_request_id uuid,
  p_quantity smallint
)
returns table (
  debit_id bigint,
  credits_consumed smallint,
  token_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_account_id uuid;
  v_reference_key text;
  v_existing_id bigint;
  v_existing_amount smallint;
  v_existing_type text;
  v_balance bigint;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'authenticated_user_required';
  end if;

  if p_request_id is null then
    raise exception using errcode = 'P0001', message = 'lead_credit_request_required';
  end if;

  if p_quantity is null
    or p_quantity < 50
    or p_quantity > 300
    or mod(p_quantity, 50) <> 0 then
    raise exception using errcode = 'P0001', message = 'lead_credit_quantity_invalid';
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

  -- Uma trava curta por conta serializa todos os débitos concorrentes.
  perform accounts.id
  from public.accounts as accounts
  where accounts.id = v_account_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'account_membership_required';
  end if;

  v_reference_key := 'lead_list_debit:' || p_request_id::text;

  select ledger.id, ledger.amount, ledger.transaction_type
    into v_existing_id, v_existing_amount, v_existing_type
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id
    and ledger.reference_key = v_reference_key;

  if found then
    if v_existing_type <> 'lead_list_debit'
      or v_existing_amount <> -p_quantity then
      raise exception using errcode = 'P0001', message = 'lead_credit_request_conflict';
    end if;

    select coalesce(sum(ledger.amount), 0)::bigint
      into v_balance
    from public.token_ledger as ledger
    where ledger.account_id = v_account_id;

    debit_id := v_existing_id;
    credits_consumed := p_quantity;
    token_balance := v_balance;
    return next;
    return;
  end if;

  select coalesce(sum(ledger.amount), 0)::bigint
    into v_balance
  from public.token_ledger as ledger
  where ledger.account_id = v_account_id;

  if v_balance < p_quantity then
    raise exception using errcode = 'P0001', message = 'insufficient_lead_credits';
  end if;

  insert into public.token_ledger (
    account_id,
    user_id,
    amount,
    transaction_type,
    reference_key,
    created_at
  )
  values (
    v_account_id,
    v_user_id,
    -p_quantity,
    'lead_list_debit',
    v_reference_key,
    timezone('utc', now())
  )
  returning id into v_existing_id;

  debit_id := v_existing_id;
  credits_consumed := p_quantity;
  token_balance := v_balance - p_quantity;
  return next;
end;
$$;

comment on function public.hcp_consume_lead_credits(uuid, smallint) is
  'Consome de 50 a 300 créditos de uma conta autenticada, com serialização e idempotência por request_id.';

revoke all on function public.hcp_consume_lead_credits(uuid, smallint)
  from public, anon, authenticated, service_role;
grant execute on function public.hcp_consume_lead_credits(uuid, smallint)
  to authenticated;

-- O navegador consulta o razão, mas nunca grava créditos ou débitos diretamente.
alter table public.token_ledger enable row level security;
revoke all on table public.token_ledger from public, anon, authenticated;
grant select on table public.token_ledger to authenticated;
