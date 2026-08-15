const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const planBuilder = require(path.join(root, 'js', 'plan-builder.js'));
const source = fs.readFileSync(path.join(root, 'js', 'plan-builder.js'), 'utf8');

test('normaliza respostas sem aceitar recursos desconhecidos ou números inválidos', () => {
  assert.deepEqual(
    planBuilder.normalizeAnswers({
      users: '2.4',
      listsPerMonth: -1,
      leadsPerMonth: '15000',
      features: ['xlsxExport', 'desconhecido', 'xlsxExport']
    }),
    {
      users: 2,
      listsPerMonth: 10,
      leadsPerMonth: 15000,
      features: ['xlsxExport']
    }
  );
});

test('recomenda Starter para operação individual de baixo volume', () => {
  const result = planBuilder.recommendPlan({
    users: 1,
    listsPerMonth: 20,
    leadsPerMonth: 2500,
    features: ['csvExport']
  });

  assert.equal(result.planId, 'starter');
  assert.equal(result.planName, 'Starter');
  assert.equal(result.isCustom, false);
  assert.equal(result.influences.length, 4);
});

test('eleva para Pro por equipe, volume ou recurso avançado', () => {
  const byUsers = planBuilder.recommendPlan({ users: 2, listsPerMonth: 10, leadsPerMonth: 1000 });
  const byLists = planBuilder.recommendPlan({ users: 1, listsPerMonth: 21, leadsPerMonth: 1000 });
  const byFeature = planBuilder.recommendPlan({
    users: 1,
    listsPerMonth: 10,
    leadsPerMonth: 1000,
    features: ['xlsxExport']
  });

  assert.equal(byUsers.planId, 'pro');
  assert.equal(byLists.planId, 'pro');
  assert.equal(byFeature.planId, 'pro');
  assert.equal(byFeature.influences.at(-1).requiredPlanId, 'pro');
});

test('recomenda Business para integrações e operação de maior porte', () => {
  const result = planBuilder.recommendPlan({
    users: 8,
    listsPerMonth: 500,
    leadsPerMonth: 100000,
    features: ['apiIntegration', 'teamWorkspace', 'prioritySupport']
  });

  assert.equal(result.planId, 'business');
  assert.equal(result.planName, 'Business');
  assert.equal(result.isCustom, false);
  assert.ok(result.influences.every((influence) => influence.requiredTier <= 2));
});

test('recomenda configuração personalizada quando excede Business ou pede fonte própria', () => {
  const byVolume = planBuilder.recommendPlan({
    users: 11,
    listsPerMonth: 1001,
    leadsPerMonth: 200001
  });
  const byFeature = planBuilder.recommendPlan({
    users: 1,
    listsPerMonth: 10,
    leadsPerMonth: 1000,
    features: ['customDataSource']
  });

  assert.equal(byVolume.planId, 'custom');
  assert.equal(byVolume.isCustom, true);
  assert.equal(byVolume.limits, null);
  assert.equal(byFeature.planId, 'custom');
  assert.equal(byFeature.influences.at(-1).requiredPlanId, 'custom');
});

test('módulo contém integração acessível, persistência e evento de confirmação', () => {
  assert.match(source, /role', 'dialog'/);
  assert.match(source, /aria-modal/);
  assert.match(source, /aria-labelledby/);
  assert.match(source, /hcp-plan-builder-draft/);
  assert.match(source, /hcp-plan-selection/);
  assert.match(source, /new root\.CustomEvent\('hcp:plan-selected', \{ detail \}\)/);
  assert.match(source, /data-hcp-plan-builder/);
  assert.match(source, /hcp:open-plan-builder/);
  assert.match(source, /hcp-lang/);
});
