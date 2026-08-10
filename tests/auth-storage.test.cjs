const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'supabase-config.js'), 'utf8');

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    has: (key) => data.has(key)
  };
}

function initializeClient(remember) {
  const localStorage = memoryStorage({ 'hcp-remember': String(remember) });
  const sessionStorage = memoryStorage();
  let options;
  const window = {
    supabase: {
      createClient(_url, _key, clientOptions) {
        options = clientOptions;
        return { configured: true };
      }
    }
  };

  vm.runInNewContext(source, { window, localStorage, sessionStorage, console });
  return { storage: options.auth.storage, localStorage, sessionStorage };
}

test('“manter conectado” salva a sessÃ£o no armazenamento persistente', () => {
  const { storage, localStorage, sessionStorage } = initializeClient(true);
  storage.setItem('auth-token', 'persistente');
  assert.equal(localStorage.getItem('auth-token'), 'persistente');
  assert.equal(sessionStorage.getItem('auth-token'), null);
  assert.equal(storage.getItem('auth-token'), 'persistente');
});

test('sessÃ£o sem “manter conectado” existe somente na aba atual', () => {
  const { storage, localStorage, sessionStorage } = initializeClient(false);
  storage.setItem('auth-token', 'temporaria');
  assert.equal(sessionStorage.getItem('auth-token'), 'temporaria');
  assert.equal(localStorage.getItem('auth-token'), null);
  assert.equal(storage.getItem('auth-token'), 'temporaria');
});

test('a leitura nÃ£o vaza uma sessÃ£o antiga do outro armazenamento', () => {
  const { storage, localStorage } = initializeClient(false);
  localStorage.setItem('auth-token', 'antiga');
  assert.equal(storage.getItem('auth-token'), null);
});

test('encerrar a sessÃ£o remove tokens persistentes e temporÃ¡rios', () => {
  const { storage, localStorage, sessionStorage } = initializeClient(true);
  localStorage.setItem('auth-token', 'local');
  sessionStorage.setItem('auth-token', 'session');
  storage.removeItem('auth-token');
  assert.equal(localStorage.has('auth-token'), false);
  assert.equal(sessionStorage.has('auth-token'), false);
});
