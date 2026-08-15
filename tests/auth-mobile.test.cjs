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
    focus() {},
    listener(type) {
      return listeners.get(type);
    }
  };
}

function loadAuth({ launchUrl, emailExists = false } = {}) {
  const ids = [
    'authForm', 'nameField', 'emailField', 'loginName', 'loginEmail', 'loginPassword',
    'signupFields', 'loginPhone', 'loginCompanyNiche', 'loginUserCount', 'loginPlanBuilderBtn', 'signupPlanSummary',
    'rememberField', 'rememberSession', 'authSubmitBtn', 'googleAuthBtn',
    'forgotPasswordBtn', 'authDivider', 'authFooter', 'authModeToggle', 'authTitle',
    'authDescription', 'authPrompt', 'authFeedback'
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, createElement()]));
  const storage = new Map();
  const calls = { redirects: [], sessions: [], signUps: [], oauth: [], planBuilder: [] };
  let appUrlListener;
  let currentSession = null;

  const user = {
    id: 'mobile-user',
    email: 'mobile@hcp.test',
    user_metadata: { full_name: 'Mobile HCP' },
    identities: emailExists ? [] : [{ id: 'email-identity', provider: 'email' }]
  };

  const client = {
    auth: {
      getSession: async () => ({ data: { session: currentSession }, error: null }),
      signUp: async (payload) => {
        calls.signUps.push(payload);
        return { data: { session: null, user }, error: null };
      },
      signInWithOAuth: async (payload) => {
        calls.oauth.push(payload);
        return { data: {}, error: null };
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
    HCPPlanBuilder: { open(options) { calls.planBuilder.push(options); } },
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

  return { appUrlListener: () => appUrlListener, calls, elements, storage };
}

const flushPromises = () => new Promise((resolvePromise) => setImmediate(resolvePromise));

test('cadastro no Android usa o deep link próprio do HCP', async () => {
  const { calls, elements } = loadAuth();
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginName.value = 'Mobile HCP';
  elements.loginPhone.value = '(11) 99999-9999';
  elements.loginCompanyNiche.value = 'Agência de Marketing';
  elements.loginUserCount.value = '3';
  elements.loginEmail.value = 'mobile@hcp.test';
  elements.loginPassword.value = 'senha-segura';
  await elements.authForm.listener('submit')({ preventDefault() {} });

  assert.equal(calls.signUps.length, 1);
  assert.equal(calls.signUps[0].options.emailRedirectTo, 'com.hcp.oportunidades://auth/callback');
  assert.equal(calls.signUps[0].options.data.phone, '(11) 99999-9999');
  assert.equal(calls.signUps[0].options.data.company_niche, 'Agência de Marketing');
  assert.equal(calls.signUps[0].options.data.expected_user_count, 3);
  assert.equal(calls.signUps[0].options.data.selected_plan, 'later');
});

test('cadastro bloqueia e-mail existente sem deixar onboarding para outra conta', async () => {
  const { calls, elements, storage } = loadAuth({ emailExists: true });
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginName.value = 'Conta Existente';
  elements.loginPhone.value = '(11) 98888-7777';
  elements.loginCompanyNiche.value = 'BPO Financeiro';
  elements.loginUserCount.value = '2';
  elements.loginEmail.value = 'existente@hcp.test';
  elements.loginPassword.value = 'senha-segura';
  await elements.authForm.listener('submit')({ preventDefault() {} });

  assert.equal(calls.signUps.length, 1);
  assert.equal(elements.authFeedback.textContent, 'Erro. Esse endereço de e-mail já está conectado à outra conta.');
  assert.match(elements.authFeedback.className, /is-error/);
  assert.equal(storage.has('hcp-pending-onboarding'), false);
});

test('cadastro com Google preserva onboarding sem exigir e-mail digitado', async () => {
  const { calls, elements, storage } = loadAuth();
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginName.value = 'Conta Google';
  elements.loginPhone.value = '(11) 97777-6666';
  elements.loginCompanyNiche.value = 'Consultoria Comercial';
  elements.loginUserCount.value = '4';
  elements.loginEmail.value = '';
  await elements.googleAuthBtn.listener('click')();

  assert.equal(calls.oauth.length, 1);
  assert.equal(calls.oauth[0].provider, 'google');
  const pending = JSON.parse(storage.get('hcp-pending-onboarding'));
  assert.equal(pending.flow, 'google');
  assert.equal(pending.email, '');
  assert.equal(pending.company_niche, 'Consultoria Comercial');
});

test('cadastro com Google exige nome antes de abrir o OAuth', async () => {
  const { calls, elements } = loadAuth();
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginName.value = '';
  elements.loginPhone.value = '(11) 97777-6666';
  elements.loginCompanyNiche.value = 'Consultoria Comercial';
  elements.loginUserCount.value = '4';
  await elements.googleAuthBtn.listener('click')();

  assert.equal(calls.oauth.length, 0);
  assert.equal(elements.authFeedback.textContent, 'Informe seu nome completo.');
});

test('Monte seu Plano parte da quantidade de usuários informada no cadastro', async () => {
  const { calls, elements } = loadAuth();
  await flushPromises();

  elements.authModeToggle.listener('click')();
  elements.loginUserCount.value = '7';
  elements.loginPlanBuilderBtn.listener('click')();

  assert.equal(calls.planBuilder.length, 1);
  assert.equal(calls.planBuilder[0].source, 'signup');
  assert.equal(calls.planBuilder[0].answers.users, 7);
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
