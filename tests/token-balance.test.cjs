const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migrationName = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .find((name) => name.endsWith('_account_token_balance_rpc.sql'));
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationName), 'utf8');
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8');

test('saldo agregado deriva usuário, prioriza a conta e soma o razão no servidor', () => {
  assert.match(migration, /create or replace function public\.hcp_get_token_balance\(\)/i);
  assert.match(migration, /v_user_id uuid := \(select auth\.uid\(\)\)/i);
  assert.match(migration, /case memberships\.role when 'owner' then 0 when 'admin' then 1 else 2 end/i);
  assert.match(migration, /coalesce\(sum\(ledger\.amount\), 0\)::bigint/i);
});

test('RPC de saldo mantém privilégios mínimos e schema canônico sincronizado', () => {
  assert.match(migration, /security definer\s+set search_path = ''/i);
  assert.match(migration, /revoke all on function public\.hcp_get_token_balance\(\)[\s\S]+from public, anon, authenticated, service_role/i);
  assert.match(migration, /grant execute on function public\.hcp_get_token_balance\(\)[\s\S]+to authenticated/i);
  assert.match(schema, /create or replace function public\.hcp_get_token_balance\(\)/i);
});
