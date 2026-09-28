const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const { generateLeads } = require('../js/leads.js');
const { keyForUser, readForUser, readLegacy, writeForUser } = require('../js/crm-storage.js');

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

test('CRM separa os dados por usuário e não atribui a ninguém o legado sem dono', () => {
  const store = storage({ 'hcp-crm-v1': '{"areas":[{"name":"Legado"}]}' });
  const alice = { areas: [{ name: 'Alice' }] };
  const bob = { areas: [{ name: 'Bob' }] };
  assert.notEqual(keyForUser('alice'), keyForUser('bob'));
  assert.throws(() => keyForUser(''), /usuário/i);
  assert.equal(readForUser(store, 'alice'), null);
  assert.deepEqual(readLegacy(store, 'alice'), { state: { areas: [{ name: 'Legado' }] }, unscoped: true });
  writeForUser(store, 'alice', alice);
  writeForUser(store, 'bob', bob);
  assert.deepEqual(readForUser(store, 'alice'), alice);
  assert.deepEqual(readForUser(store, 'bob'), bob);
  assert.equal(store.getItem('hcp-crm-v1'), '{"areas":[{"name":"Legado"}]}');
});

test('importação local não altera nem apaga o registro legado original', () => {
  const store = storage({ 'hcp-crm-v1:alice': '{"areas":[{"name":"Privado"}]}' });
  assert.deepEqual(readLegacy(store, 'alice'), { state: { areas: [{ name: 'Privado' }] }, unscoped: false });
  assert.equal(readLegacy(store, 'bob'), null);
  assert.equal(store.getItem('hcp-crm-v1:alice'), '{"areas":[{"name":"Privado"}]}');
});

test('lista de demonstração não produz contatos ou URLs reais e é identificável', () => {
  const leads = generateLeads({
    niche: 'Agências de Marketing', state: 'SP', city: 'Campinas', quantity: 50,
    filters: { size: 'any', status: 'active', type: 'any', website: 'any' }
  });
  assert.equal(leads.length, 50);
  assert.equal(leads.every((lead) => lead.source.includes('SIMULADO')), true);
  assert.equal(leads.every((lead) => lead.email.endsWith('.example')), true);
  assert.equal(leads.every((lead) => lead.phone.startsWith('00')), true);
  assert.equal(leads.every((lead) => lead.site === 'Sem site' || new URL(lead.site).hostname.endsWith('.example')), true);
});

test('interface identifica a simulação e não debita créditos no envio do formulário', () => {
  const page = fs.readFileSync(path.join(root, 'html', 'gerar-leads.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'js', 'leads.js'), 'utf8');
  assert.match(page, /dados sintéticos/i);
  assert.match(page, /nenhum crédito será debitado/i);
  const submitFlow = script.split("form.addEventListener('submit', async (event) => {")[1]
    .split("elements.clear.addEventListener('click'")[0];
  assert.doesNotMatch(submitFlow, /debitGeneratedList\(/);
  assert.match(page, /Modo demonstração/);
});
