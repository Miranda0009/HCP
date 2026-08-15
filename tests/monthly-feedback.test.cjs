const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const migrationDirectory = path.join(root, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationDirectory)
  .filter((name) => name.endsWith('_monthly_feedback_limits_and_accounts.sql'));

assert.equal(migrationFiles.length, 1, 'a migration mensal deve ter sido criada uma única vez pelo Supabase CLI');

const migration = fs.readFileSync(path.join(migrationDirectory, migrationFiles[0]), 'utf8');
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8');
const html = fs.readFileSync(path.join(root, 'html', 'segmentos.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js', 'segmentos.js'), 'utf8');

test('contas empresariais são aditivas e o backfill usa o UUID do usuário', () => {
  assert.match(migration, /create table if not exists public\.accounts/i);
  assert.match(migration, /create table if not exists public\.account_memberships/i);
  assert.match(migration, /expected_user_count smallint/i);
  assert.match(migration, /phone text/i);
  assert.match(migration, /company_niche text/i);
  assert.match(migration, /select\s+users\.id,\s+users\.id,/i);
  assert.match(migration, /values \(new\.id, new\.id, 'owner'\)/i);
  assert.match(migration, /raw_user_meta_data ->> 'phone'/i);
  assert.match(migration, /raw_user_meta_data ->> 'company_niche'/i);
  assert.match(migration, /raw_user_meta_data ->> 'expected_user_count'/i);
  assert.doesNotMatch(migration, /update\s+public\.profiles/i);
});

test('uso mensal e razão de tokens preservam registros anteriores', () => {
  assert.match(migration, /add column if not exists account_id uuid/i);
  assert.match(migration, /add column if not exists submitted_by uuid/i);
  assert.match(migration, /add column if not exists exchange_date date/i);
  assert.match(migration, /add column if not exists confirmed_at timestamptz/i);
  assert.match(migration, /create table if not exists public\.monthly_exchange_usage/i);
  assert.match(migration, /create table if not exists public\.token_ledger/i);
  assert.match(migration, /least\(count\(\*\), 3\)::smallint/i);
  assert.match(migration, /from public\.lead_source_feedback as feedback\s+on conflict \(source_feedback_id\) do nothing/is);
  assert.match(migration, /transaction_type in \('feedback_reward', 'lead_list_debit', 'manual_adjustment'\)/i);
});

test('limite de três trocas é atômico e também protege INSERT legado', () => {
  assert.match(migration, /create or replace function private\.prepare_feedback_exchange\(\)/i);
  assert.match(migration, /before insert on public\.lead_source_feedback/i);
  assert.match(migration, /on conflict \(account_id, cycle_start\) do update/i);
  assert.match(migration, /where public\.monthly_exchange_usage\.used_count < 3/i);
  assert.match(migration, /message = 'monthly_exchange_limit_reached'/i);
  assert.match(migration, /timezone\('America\/Sao_Paulo', now\(\)\)/i);
  assert.match(migration, /new\.tokens_awarded := 25/i);
  assert.match(migration, /after insert on public\.lead_source_feedback/i);
  assert.match(migration, /grant select, insert on table public\.lead_source_feedback to authenticated/i);
});

test('RPC deriva o usuário e retorna o estado completo da conta', () => {
  assert.match(migration, /create or replace function public\.hcp_submit_lead_feedback/i);
  assert.match(migration, /v_user_id uuid := \(select auth\.uid\(\)\)/i);
  assert.match(migration, /p_confirmed is distinct from true/i);
  assert.match(migration, /security definer\s+set search_path = ''/i);
  assert.match(migration, /exchanges_used smallint/i);
  assert.match(migration, /exchanges_remaining smallint/i);
  assert.match(migration, /next_renewal date/i);
  assert.match(migration, /token_balance bigint/i);
  assert.match(migration, /revoke all on function public\.hcp_submit_lead_feedback[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.hcp_submit_lead_feedback[\s\S]+to authenticated/i);
});

test('todas as novas tabelas expostas possuem RLS, grants mínimos e índices', () => {
  for (const table of ['accounts', 'account_memberships', 'monthly_exchange_usage', 'token_ledger']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated`, 'i'));
  }
  assert.match(migration, /using \(\(select private\.is_account_member\(account_id\)\)\)/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = owner_user_id\)\s+with check \(\(select auth\.uid\(\)\) = owner_user_id\)/i);
  assert.match(migration, /account_memberships_user_account_idx/i);
  assert.match(migration, /token_ledger_account_created_idx/i);
});

test('schema canônico contém a mesma estrutura mensal essencial', () => {
  assert.match(schema, /create table if not exists public\.accounts/i);
  assert.match(schema, /create table if not exists public\.monthly_exchange_usage/i);
  assert.match(schema, /create table if not exists public\.token_ledger/i);
  assert.match(schema, /create or replace function public\.hcp_submit_lead_feedback/i);
  assert.match(schema, /monthly_exchange_limit_reached/i);
});

test('interface exige nome, mostra data e confirmação e exibe os quatro indicadores', () => {
  assert.match(html, /id="feedbackSourceList"[^>]+required/i);
  assert.match(html, /id="feedbackExchangeDate"[^>]+readonly/i);
  assert.match(html, /id="confirmLeadExchange"[^>]+required/i);
  assert.match(html, /id="monthlyExchangeUsed"/i);
  assert.match(html, /id="monthlyExchangeRemaining"/i);
  assert.match(html, /id="monthlyExchangeRenewal"/i);
  assert.match(html, /id="tokenBalance"/i);
});

test('cliente novo usa somente a RPC e bloqueia o botão no limite', () => {
  assert.match(script, /\.rpc\('hcp_submit_lead_feedback', payload\)/i);
  assert.match(script, /\.rpc\('hcp_get_token_balance'\)/i);
  assert.doesNotMatch(script, /\.from\('lead_source_feedback'\)[\s\S]{0,120}\.insert\(/i);
  assert.doesNotMatch(script, /\.from\('token_ledger'\)/i);
  assert.match(script, /p_confirmed: true/i);
  assert.match(script, /monthlyLimitReached = remaining === 0 \|\| used >= 3/i);
  assert.match(script, /feedbackSubmitButton\.disabled = feedbackSubmitting \|\| monthlyLimitReached/i);
  assert.match(script, /monthly_exchange_limit_reached/i);
  assert.match(script, /feedback_confirmation_required/i);
  assert.match(script, /America\/Sao_Paulo/i);
});

test('envio confirmado chama a RPC e aplica imediatamente o limite retornado', async () => {
  const elements = {};
  const element = (id, value = '') => {
    const handlers = {};
    const item = {
      id,
      value,
      checked: false,
      disabled: false,
      hidden: false,
      textContent: '',
      className: '',
      handlers,
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(type, handler) { handlers[type] = handler; },
      focus() {},
      dispatchEvent() {},
      replaceChildren() {}
    };
    elements[id] = item;
    return item;
  };

  const form = element('leadFeedbackForm');
  form.checkValidity = () => true;
  form.reportValidity = () => {};
  form.reset = () => {};
  element('feedbackCnpj', '12.345.678/0001-95');
  element('feedbackCompanyName', 'Empresa Teste');
  element('feedbackNiche', 'Tecnologia');
  element('feedbackPhone', '(11) 99999-9999');
  element('feedbackApiSource', 'CNPJá');
  element('feedbackSourceList', 'Lista de agosto');
  element('feedbackUsefulness', '5');
  element('feedbackNotes', 'Dados completos');
  element('feedbackExchangeDate');
  const confirmation = element('confirmLeadExchange');
  confirmation.checked = true;
  const submit = element('submitLeadFeedback');
  element('leadFeedbackMessage');
  element('tokenBalance');
  element('monthlyExchangeUsed');
  element('monthlyExchangeRemaining');
  element('monthlyExchangeRenewal');
  element('cnpjaCompanyCard');

  const rpcCalls = [];
  const query = (table) => {
    const builder = {
      select() { return builder; },
      eq() { return builder; },
      order() { return builder; },
      limit() { return builder; },
      async maybeSingle() {
        if (table === 'account_memberships') {
          return { data: { account_id: 'account-1', created_at: '2026-08-01T00:00:00Z' }, error: null };
        }
        if (table === 'monthly_exchange_usage') return { data: { used_count: 2 }, error: null };
        return { data: null, error: null };
      },
      then(resolve, reject) {
        const result = table === 'account_memberships'
          ? { data: [{ account_id: 'account-1', role: 'owner', created_at: '2026-08-01T00:00:00Z' }], error: null }
          : { data: [], error: null };
        return Promise.resolve(result).then(resolve, reject);
      }
    };
    return builder;
  };

  const window = {
    hcpProfileReady: Promise.resolve(),
    hcpSupabase: {
      from: query,
      async rpc(name, payload) {
        rpcCalls.push({ name, payload });
        if (name === 'hcp_get_token_balance') {
          return { data: [{ account_id: 'account-1', token_balance: 50 }], error: null };
        }
        return {
          data: [{
            feedback_id: 'feedback-1',
            tokens_awarded: 25,
            exchanges_used: 3,
            exchanges_remaining: 0,
            next_renewal: '2026-09-01',
            token_balance: 75
          }],
          error: null
        };
      }
    },
    HCPCnpja: {
      onlyDigits: (value) => String(value || '').replace(/\D/g, ''),
      formatCnpj: (value) => value,
      isValidCnpj: () => true
    },
    location: { hash: '', pathname: '/html/segmentos.html' },
    history: { replaceState() {} }
  };

  const document = {
    querySelectorAll: () => [],
    getElementById: (id) => elements[id] || null,
    addEventListener() {},
    createElement: () => element('generated')
  };

  const context = vm.createContext({
    window,
    document,
    localStorage: { getItem: () => null },
    Intl,
    Date,
    Promise,
    URL,
    console,
    Event: class Event {}
  });

  vm.runInContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  await form.handlers.submit({ preventDefault() {} });

  const submitCall = rpcCalls.find((call) => call.name === 'hcp_submit_lead_feedback');
  assert.ok(rpcCalls.some((call) => call.name === 'hcp_get_token_balance'));
  assert.ok(submitCall);
  assert.equal(submitCall.payload.p_source_list, 'Lista de agosto');
  assert.equal(submitCall.payload.p_confirmed, true);
  assert.equal(elements.monthlyExchangeUsed.textContent, '3 / 3');
  assert.equal(elements.monthlyExchangeRemaining.textContent, '0');
  assert.equal(elements.tokenBalance.textContent, '75');
  assert.equal(submit.disabled, true);
  assert.match(submit.textContent, /Limite mensal atingido/);
});
