const test = require('node:test');
const assert = require('node:assert/strict');
const flow = require('../js/pilot-workflows.js');
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const criteria = { niche: 'Clínicas', state: 'SP', city: 'São Paulo', quantity: 100,
  filters: { size: 'small', status: 'active', type: 'all', website: 'all' } };
test('histórico restaura critérios e separa usuários', () => {
  const store = storage();
  const entry = flow.recordSearch(store, 'alice', criteria, 100);
  assert.deepEqual(flow.findSearch(store, 'alice', entry.id).criteria, criteria);
  assert.equal(flow.findSearch(store, 'bob', entry.id), null);
  assert.equal(flow.readHistory(store, 'bob').length, 0);
});
test('histórico mantém 20 pesquisas e rejeita armazenamento inválido', () => {
  const store = storage();
  for (let i = 0; i < 25; i++) flow.recordSearch(store, 'alice', criteria, 100);
  assert.equal(flow.readHistory(store, 'alice').length, 20);
  store.setItem('hcp-search-history:alice', '{bad');
  assert.deepEqual(flow.readHistory(store, 'alice'), []);
  assert.throws(() => flow.recordSearch(store, '', criteria, 100));
});
test('plano de piloto não representa pagamento e rejeita valores desconhecidos', () => {
  assert.equal(flow.makePilotPlan('Pro', 'monthly').status, 'pilot_active');
  assert.equal(flow.makePilotPlan('Pro', 'monthly').charged, false);
  assert.equal(flow.makePilotPlan('Arranque', 'yearly').id, 'starter');
  assert.throws(() => flow.makePilotPlan('admin', 'monthly'));
});
test('plano remoto só é confirmado após salvar; falha não muda a seleção', async () => {
  let payload;
  const client = { auth: { updateUser: async data => { payload = data; return { data: { user: {} }, error: null }; } } };
  const plan = await flow.savePilotPlan(client, 'pro', 'monthly');
  assert.equal(payload.data.hcp_pilot_plan.id, 'pro');
  assert.equal(plan.charged, false);
  await assert.rejects(flow.savePilotPlan({ auth: { updateUser: async () => ({ error: new Error('offline') }) } }, 'pro', 'monthly'), /offline/);
});
