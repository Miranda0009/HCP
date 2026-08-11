(function initializeAuthPage() {
  const client = window.hcpSupabase;
  const form = document.getElementById('authForm');
  if (!form) return;

  const nameField = document.getElementById('nameField');
  const emailField = document.getElementById('emailField');
  const nameInput = document.getElementById('loginName');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberField = document.getElementById('rememberField');
  const rememberSession = document.getElementById('rememberSession');
  const submitButton = document.getElementById('authSubmitBtn');
  const googleButton = document.getElementById('googleAuthBtn');
  const forgotButton = document.getElementById('forgotPasswordBtn');
  const divider = document.getElementById('authDivider');
  const footer = document.getElementById('authFooter');
  const modeToggle = document.getElementById('authModeToggle');
  const title = document.getElementById('authTitle');
  const description = document.getElementById('authDescription');
  const prompt = document.getElementById('authPrompt');
  const feedback = document.getElementById('authFeedback');
  const MOBILE_AUTH_CALLBACK = 'com.hcp.oportunidades://auth/callback';
  const isRecoveryCallback = new URLSearchParams(window.location.search).get('recovery') === '1';
  let mode = isRecoveryCallback ? 'recovery' : 'signin';
  let lastMobileAuthUrl = '';

  const isEnglish = () => {
    try {
      return localStorage.getItem('hcp-language') === 'en-US';
    } catch {
      return false;
    }
  };

  const copy = (pt, en) => isEnglish() ? en : pt;
  const loginUrl = (recovery = false) => new URL(`login.html${recovery ? '?recovery=1' : ''}`, window.location.href).href;
  const dashboardUrl = () => new URL('painel.html', window.location.href).href;
  const isNativeApp = () => {
    const capacitor = window.Capacitor;
    return Boolean(capacitor?.isNativePlatform?.() || capacitor?.getPlatform?.() === 'android');
  };
  const authRedirectUrl = (recovery = false) => {
    if (!isNativeApp()) return loginUrl(recovery);
    return `${MOBILE_AUTH_CALLBACK}${recovery ? '?recovery=1' : ''}`;
  };

  function showFeedback(message, type = 'info') {
    feedback.textContent = message;
    feedback.className = `auth-feedback${type === 'info' ? '' : ` is-${type}`}`;
    feedback.hidden = !message;
  }

  function friendlyError(error) {
    const message = error?.message || '';
    const knownMessages = {
      'Invalid login credentials': copy('E-mail ou senha incorretos.', 'Incorrect email or password.'),
      'Email not confirmed': copy('Confirme seu e-mail antes de entrar.', 'Confirm your email before signing in.'),
      'User already registered': copy('Já existe uma conta com este e-mail.', 'An account with this email already exists.'),
      'Unsupported provider: provider is not enabled': copy(
        'O acesso com Google ainda precisa ser ativado no painel do Supabase.',
        'Google sign-in still needs to be enabled in the Supabase dashboard.'
      )
    };
    return knownMessages[message] || message || copy('Não foi possível concluir. Tente novamente.', 'Unable to complete the request. Try again.');
  }

  function setBusy(isBusy, label) {
    submitButton.disabled = isBusy;
    googleButton.disabled = isBusy;
    modeToggle.disabled = isBusy;
    forgotButton.disabled = isBusy;
    if (label) submitButton.textContent = label;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const isSignup = mode === 'signup';
    const isRecovery = mode === 'recovery';

    nameField.hidden = !isSignup;
    nameInput.required = isSignup;
    emailField.hidden = isRecovery;
    emailInput.required = !isRecovery;
    rememberField.hidden = isSignup || isRecovery;
    forgotButton.hidden = isSignup || isRecovery;
    divider.hidden = isRecovery;
    googleButton.hidden = isRecovery;
    footer.hidden = isRecovery;
    passwordInput.autocomplete = isSignup ? 'new-password' : (isRecovery ? 'new-password' : 'current-password');
    showFeedback('');

    if (isSignup) {
      title.textContent = copy('Crie sua conta', 'Create your account');
      description.textContent = copy('Comece a organizar suas oportunidades no HCP.', 'Start organizing your opportunities in HCP.');
      submitButton.textContent = copy('Criar conta', 'Create account');
      prompt.textContent = copy('Já tem uma conta?', 'Already have an account?');
      modeToggle.textContent = copy('Entrar', 'Sign in');
      return;
    }

    if (isRecovery) {
      title.textContent = copy('Crie uma nova senha', 'Create a new password');
      description.textContent = copy('Digite uma senha segura para recuperar sua conta.', 'Enter a secure password to recover your account.');
      passwordInput.placeholder = copy('Nova senha com pelo menos 8 caracteres', 'New password with at least 8 characters');
      submitButton.textContent = copy('Salvar nova senha', 'Save new password');
      return;
    }

    title.textContent = copy('Bem-vindo de volta', 'Welcome back');
    description.textContent = copy('Entre na sua conta para continuar.', 'Sign in to your account to continue.');
    passwordInput.placeholder = copy('Digite sua senha', 'Enter your password');
    submitButton.textContent = copy('Entrar agora', 'Sign in now');
    prompt.textContent = copy('Ainda não tem uma conta?', "Don't have an account yet?");
    modeToggle.textContent = copy('Crie uma conta', 'Create an account');
  }

  function saveRememberChoice() {
    try {
      localStorage.setItem('hcp-remember', String(rememberSession.checked));
    } catch {
      // A opção é aplicada somente nesta sessão quando o armazenamento não está disponível.
    }
  }

  async function cacheAuthenticatedProfile(user) {
    if (!user) return;
    const metadata = user.user_metadata || {};
    let profile = {};

    try {
      const result = await client
        .from('profiles')
        .select('full_name, avatar_url, company_name')
        .eq('id', user.id)
        .maybeSingle();
      if (!result.error) profile = result.data || {};
    } catch {
      // Os metadados do Auth ainda permitem preparar as iniciais antes do redirecionamento.
    }

    window.hcpProfileCache?.write({
      id: user.id,
      full_name: profile.full_name || metadata.full_name || metadata.name || user.email?.split('@')[0] || '',
      avatar_url: profile.avatar_url || metadata.avatar_url || metadata.picture || '',
      company_name: profile.company_name || ''
    });
  }

  function mobileCallbackParams(url) {
    const params = new URLSearchParams(url.search);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    hashParams.forEach((value, key) => params.set(key, value));
    return params;
  }

  function isTrustedMobileCallback(url) {
    if (url.protocol === 'com.hcp.oportunidades:') {
      return url.hostname === 'auth' && url.pathname === '/callback';
    }

    return ['http:', 'https:'].includes(url.protocol)
      && url.hostname === 'localhost'
      && url.port === '3000';
  }

  async function handleMobileAuthUrl(rawUrl) {
    if (!rawUrl || rawUrl === lastMobileAuthUrl || !client) return;

    let callbackUrl;
    try {
      callbackUrl = new URL(rawUrl);
    } catch {
      return;
    }

    if (!isTrustedMobileCallback(callbackUrl)) return;
    lastMobileAuthUrl = rawUrl;

    const params = mobileCallbackParams(callbackUrl);
    const errorMessage = params.get('error_description') || params.get('error');
    if (errorMessage) {
      let readableError = errorMessage.replace(/\+/g, ' ');
      try {
        readableError = decodeURIComponent(readableError);
      } catch {
        // A mensagem original ainda é legível quando não usa codificação de URL válida.
      }
      showFeedback(readableError, 'error');
      return;
    }

    const isRecovery = params.get('type') === 'recovery' || params.get('recovery') === '1';
    let session = null;

    try {
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const result = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (result.error) throw result.error;
        session = result.data.session;
      } else if (params.get('code')) {
        const result = await client.auth.exchangeCodeForSession(params.get('code'));
        if (result.error) throw result.error;
        session = result.data.session;
      }

      if (!session) return;

      if (isRecovery) {
        setMode('recovery');
        showFeedback(copy('Link confirmado. Crie agora sua nova senha.', 'Link confirmed. Create your new password now.'), 'success');
        return;
      }

      await cacheAuthenticatedProfile(session.user);
      window.location.replace(dashboardUrl());
    } catch (error) {
      showFeedback(friendlyError(error), 'error');
    }
  }

  async function setupMobileAuthRedirects() {
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (!appPlugin?.addListener || !appPlugin?.getLaunchUrl) return;

    await appPlugin.addListener('appUrlOpen', ({ url }) => {
      handleMobileAuthUrl(url);
    });

    const launch = await appPlugin.getLaunchUrl();
    if (launch?.url) await handleMobileAuthUrl(launch.url);
  }

  async function redirectAuthenticatedUser() {
    if (!client) {
      showFeedback(copy('Não foi possível carregar a conexão com o Supabase.', 'Could not load the Supabase connection.'), 'error');
      return;
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      showFeedback(friendlyError(error), 'error');
      return;
    }

    if (data.session && mode !== 'recovery') {
      await cacheAuthenticatedProfile(data.session.user);
      window.location.replace(dashboardUrl());
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    saveRememberChoice();
    setBusy(true, copy('Aguarde...', 'Please wait...'));
    showFeedback('');

    try {
      if (mode === 'recovery') {
        const { error } = await client.auth.updateUser({ password: passwordInput.value });
        if (error) throw error;
        await client.auth.signOut();
        window.history.replaceState({}, '', 'login.html');
        setMode('signin');
        passwordInput.value = '';
        showFeedback(copy('Senha atualizada. Entre novamente.', 'Password updated. Sign in again.'), 'success');
        return;
      }

      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: emailInput.value.trim(),
          password: passwordInput.value,
          options: {
            data: { full_name: nameInput.value.trim() },
            emailRedirectTo: authRedirectUrl()
          }
        });
        if (error) throw error;
        if (data.session) {
          await cacheAuthenticatedProfile(data.user);
          window.location.replace(dashboardUrl());
        } else {
          showFeedback(copy('Conta criada. Confira seu e-mail para confirmar o acesso.', 'Account created. Check your email to confirm access.'), 'success');
        }
        return;
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
      });
      if (error) throw error;
      await cacheAuthenticatedProfile(data.user);
      window.location.replace(dashboardUrl());
    } catch (error) {
      showFeedback(friendlyError(error), 'error');
    } finally {
      setBusy(false);
      if (mode !== 'recovery') {
        submitButton.textContent = mode === 'signup' ? copy('Criar conta', 'Create account') : copy('Entrar agora', 'Sign in now');
      }
    }
  });

  googleButton.addEventListener('click', async () => {
    if (!client) return;
    if (window.location.protocol === 'file:') {
      showFeedback(copy('Abra o site com o Live Server para usar o login do Google.', 'Open the site with Live Server to use Google sign-in.'), 'error');
      return;
    }

    saveRememberChoice();
    setBusy(true);
    showFeedback('');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authRedirectUrl() }
    });
    if (error) {
      showFeedback(friendlyError(error), 'error');
      setBusy(false);
    }
  });

  forgotButton.addEventListener('click', async () => {
    if (!client) return;
    if (!emailInput.value || !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    setBusy(true);
    const { error } = await client.auth.resetPasswordForEmail(emailInput.value.trim(), {
      redirectTo: authRedirectUrl(true)
    });
    showFeedback(
      error ? friendlyError(error) : copy('Enviamos um link de recuperação para seu e-mail.', 'We sent a recovery link to your email.'),
      error ? 'error' : 'success'
    );
    setBusy(false);
    submitButton.textContent = copy('Entrar agora', 'Sign in now');
  });

  modeToggle.addEventListener('click', () => setMode(mode === 'signup' ? 'signin' : 'signup'));
  rememberSession.addEventListener('change', saveRememberChoice);

  try {
    rememberSession.checked = localStorage.getItem('hcp-remember') !== 'false';
  } catch {
    rememberSession.checked = true;
  }

  client?.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') setMode('recovery');
  });

  setMode(mode);
  setupMobileAuthRedirects()
    .catch(() => {})
    .finally(redirectAuthenticatedUser);
})();
