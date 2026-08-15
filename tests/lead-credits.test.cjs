const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const migrationName = fs.readdirSync(migrationsDir)
  .find((name) => name.endsWith('_lead_credit_ledger_and_consumption.sql'));

assert.ok(migrationName, 'A migration oficial de créditos precisa existir.');

const migration = fs.readFileSync(path.join(migrationsDir, migrationName), 'utf8');
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8');

test('reference_key é aditiva e única por conta', () => {
  assert.match(migration, /add column if not exists reference_key text/i);
  assert.match(migration, /unique \(account_id, reference_key\)/i);
  assert.match(migration, /token_ledger_account_reference_key_unique/i);
});

test('toda conta recebe 1000 créditos uma única vez', () => {
  assert.match(migration, /create or replace function private\.grant_initial_account_credits\(\)/i);
  assert.match(migration, /after insert on public\.accounts/i);
  assert.match(migration, /'manual_adjustment'/i);
  assert.match(migration, /'initial_balance_v1'/i);
  assert.match(migration, /\b1000\b/i);
  assert.match(migration, /from public\.accounts as accounts\s+on conflict on constraint token_ledger_account_reference_key_unique do nothing/is);
});

test('RPC deriva usuário e conta, valida quantidade e serializa débitos', () => {
  assert.match(migration, /create or replace function public\.hcp_consume_lead_credits\(\s*p_request_id uuid,\s*p_quantity smallint/is);
  assert.match(migration, /v_user_id uuid := \(select auth\.uid\(\)\)/i);
  assert.match(migration, /from public\.account_memberships as memberships/i);
  assert.match(migration, /p_quantity < 50[\s\S]+p_quantity > 300[\s\S]+mod\(p_quantity, 50\) <> 0/i);
  assert.match(migration, /from public\.accounts as accounts[\s\S]+for update/i);
  assert.match(migration, /message = 'insufficient_lead_credits'/i);
});

test('request_id torna o débito idempotente e detecta conflito de quantidade', () => {
  assert.match(migration, /v_reference_key := 'lead_list_debit:' \|\| p_request_id::text/i);
  assert.match(migration, /ledger\.reference_key = v_reference_key/i);
  assert.match(migration, /message = 'lead_credit_request_conflict'/i);
  assert.match(migration, /'lead_list_debit'/i);
  assert.match(migration, /-p_quantity/i);
  assert.match(migration, /debit_id bigint/i);
  assert.match(migration, /credits_consumed smallint/i);
  assert.match(migration, /token_balance bigint/i);
});

test('cliente só executa a RPC e não grava diretamente no razão', () => {
  assert.match(migration, /security definer\s+set search_path = ''/i);
  assert.match(migration, /revoke all on function public\.hcp_consume_lead_credits\(uuid, smallint\)[\s\S]+from public, anon, authenticated, service_role/i);
  assert.match(migration, /grant execute on function public\.hcp_consume_lead_credits\(uuid, smallint\)[\s\S]+to authenticated/i);
  assert.match(migration, /revoke all on table public\.token_ledger from public, anon, authenticated/i);
  assert.match(migration, /grant select on table public\.token_ledger to authenticated/i);
  assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete)[^;]*token_ledger[^;]*authenticated/i);
});

test('schema canônico replica a estrutura essencial de créditos', () => {
  assert.match(schema, /add column if not exists reference_key text/i);
  assert.match(schema, /create or replace function private\.grant_initial_account_credits\(\)/i);
  assert.match(schema, /create or replace function public\.hcp_consume_lead_credits/i);
  assert.match(schema, /lead_credit_quantity_invalid/i);
  assert.match(schema, /insufficient_lead_credits/i);
});
