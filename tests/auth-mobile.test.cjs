const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const authSource = readFileSync(resolve(__dirname, '../js/auth.js'), 'utf8');

function createElement() {
  const listeners = new Map();
  return {
    hidden: false,
    required: false,
    checked: true,
    disabled: false,
    value: '',
    textContent: '',
    className: '',
    placeholder: '',
    autocomplete: '',
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    checkValidity: () => true,
    reportValidity() {},
    listener(type) {
      return listeners.get(type);
    }
  };
}

function loadAuth({ launchUrl } = {}) {
  const ids = [
    'authForm', 'nameField', 'emailField', 'loginName', 'loginEmail', 'loginPassword',
    'rememberField', 'rememberSession', 'authSubmitBtn', 'googleAuthBtn',
    'forgotPasswordBtn', 'authDivider', 'authFooter', 'authModeToggle', 'authTitle',
    'authDescription', 'authPrompt', 'authFeedback'
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, createElement()]));
  const storage = new Map();
  const calls = { redirects: [], sessions: [], signUps: [] };
  let appUrlListener;
  let currentSession = null;

  const user = {
    id: 'mobile-user',
    email: 'mobile@hcp.test',
    user_metadata: { full_name: 'Mobile HCP' }
  };

  const client = {
    auth: {
      getSession: async () => ({ data: { session: currentSession }, error: null }),
      signUp: async (payload) => {
        calls.signUps.push(payload);
        return { data: { session: null, user }, error: null };
      },
      setSession: async (tokens) => {
        calls.sessions.push(tokens);
        currentSession = { user };
        return { data: { session: currentSession }, error: null };
      },
      exchangeCodeForSession: async () => ({ data: { session: currentSession }, error: null }),
      onAuthStateChange() {}
    },
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: { full_name: 'Mobile HCP', avatar_url: null }, error: null })
              };
            }
          };
        }
      };
    }
  };

  const location = {
    href: 'https://localhost/html/login.html',
    pathname: '/html/login.html',
    protocol: 'https:',
    search: '',
    replace(url) {
      calls.redirects.push(url);
    }
  };

  const window = {
    location,
    hcpSupabase: client,
    hcpProfileCache: { write() {} },
    history: { replaceState() {} },
    Capacitor: {
      isNativePlatform: () => true,
      getPlatform: () => 'android',
      Plugins: {
        App: {
          async addListener(_event, listener) {
            appUrlListener = listener;
          },
          async getLaunchUrl() {
            return launchUrl ? { url: launchUrl } : undefined;
          }
        }
      }
    }
  };

  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  };

  vm.runInNewContext(authSource, {
    window,
    document: { getElementById: (id) => elements[id] },
    localStorage,
    URL,
    URLSearchParams,
    decodeURIComponent,
    console
  });

  return { appUrlListener: () => appUrlListener, calls, elements };
}

const flushPromises = () => new Promise((resolvePromise) => setImmediate(resolvePromise));

test('cadastro no Android usa o deep link próprio do HCP', async () => {
  const { calls, elements } = loadAuth();
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginName.value = 'Mobile HCP';
  elements.loginEmail.value = 'mobile@hcp.test';
  elements.loginPassword.value = 'senha-segura';
  await elements.authForm.listener('submit')({ preventDefault() {} });

  assert.equal(calls.signUps.length, 1);
  assert.equal(calls.signUps[0].options.emailRedirectTo, 'com.hcp.oportunidades://auth/callback');
});

test('callback móvel cria a sessão e volta para o painel', async () => {
  const callback = 'com.hcp.oportunidades://auth/callback#access_token=access-token&refresh_token=refresh-token&type=signup';
  const { calls } = loadAuth({ launchUrl: callback });
  await flushPromises();
  await flushPromises();

  assert.equal(calls.sessions.length, 1);
  assert.equal(calls.sessions[0].access_token, 'access-token');
  assert.equal(calls.sessions[0].refresh_token, 'refresh-token');
  assert.ok(calls.redirects.some((url) => url === 'https://localhost/html/painel.html'));
});
