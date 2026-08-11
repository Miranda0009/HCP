const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'js', 'script.js'), 'utf8');
const context = vm.createContext({
  document: {
    title: 'HCP',
    documentElement: { dataset: {} },
    getElementById() { return null; },
    addEventListener() {}
  },
  localStorage: {
    getItem() { return null; },
    setItem() {}
  },
  URLSearchParams,
  console
});

vm.runInContext(script, context);

test('busca incremental ignora acentos e encontra empresas por prefixo', () => {
  const results = vm.runInContext("findCommandEntries('solu')", context);
  assert.ok(results.length >= 2);
  assert.equal(results[0].name, 'Soluções Inteligentes');
  assert.ok(results.some((entry) => entry.name === 'Soluções Pioneiras'));
});

test('empresa pesquisada recebe um destino direto para sua posição', () => {
  const [result] = vm.runInContext("findCommandEntries('soluções inteligentes')", context);
  assert.equal(result.href, 'pesquisar.html?empresa=Solu%C3%A7%C3%B5es%20Inteligentes#empresa-solucoes-inteligentes');

  const panel = fs.readFileSync(path.join(root, 'html', 'painel.html'), 'utf8');
  assert.match(panel, /id="empresa-solucoes-pioneiras"/);
});

test('catálogo antigo de segmentos não aparece mais', () => {
  const segments = fs.readFileSync(path.join(root, 'html', 'segmentos.html'), 'utf8');
  assert.doesNotMatch(segments, /Segmentos prontos/);
  assert.doesNotMatch(segments, /Agências de Marketing – Principal cliente/);
  assert.match(segments, /data-segment-panel="exchange"/);
});
