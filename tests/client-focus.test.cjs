const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'html', 'segmentos.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js', 'segmentos.js'), 'utf8');
const translations = fs.readFileSync(path.join(root, 'js', 'script.js'), 'utf8');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260812164342_create_client_focus_profiles.sql'),
  'utf8'
);

test('cliente foco tem exatamente três perguntas e não pede usuários do HCP', () => {
  assert.equal((html.match(/<label class="client-focus-question"/g) || []).length, 3);
  assert.match(html, /id="clientFocusNiche"[^>]+required/);
  assert.match(html, /id="clientFocusCompanySize"[^>]+required/);
  assert.match(html, /id="clientFocusSignal"[^>]+required/);
  assert.doesNotMatch(html, /Quantos usuários utilizarão o HCP/i);
});

test('cliente foco é carregado e salvo por usuário autenticado', () => {
  assert.match(script, /client\.auth\.getUser\(\)/);
  assert.match(script, /\.from\('client_focus_profiles'\)/);
  assert.match(script, /\.eq\('user_id', user\.id\)/);
  assert.match(script, /\.upsert\(payload, \{ onConflict: 'user_id' \}\)/);
  assert.match(script, /user_id: user\.id/);
});

test('perfil de cliente foco possui RLS e permissões mínimas', () => {
  assert.match(migration, /alter table public\.client_focus_profiles enable row level security/i);
  assert.match(migration, /revoke all on public\.client_focus_profiles from anon/i);
  assert.match(migration, /grant select, insert, update on public\.client_focus_profiles to authenticated/i);
  assert.equal((migration.match(/create policy /gi) || []).length, 3);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);
});

test('novas perguntas têm tradução para inglês', () => {
  assert.match(translations, /"Qual é o seu cliente foco\?": "Who is your target customer\?"/);
  assert.match(translations, /"Salvar cliente foco": "Save target customer"/);
  assert.match(translations, /"Qual sinal indica uma boa oportunidade\?"/);
});
