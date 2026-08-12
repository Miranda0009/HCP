(function initializeSegmentExchange() {
  const tabs = Array.from(document.querySelectorAll('[data-segment-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-segment-panel]'));

  const client = window.hcpSupabase;
  const cnpj = window.HCPCnpja;
  const form = document.getElementById('leadFeedbackForm');
  const cnpjInput = document.getElementById('feedbackCnpj');
  const lookupButton = document.getElementById('lookupCnpjBtn');
  const lookupFeedback = document.getElementById('cnpjaFeedback');
  const companyCard = document.getElementById('cnpjaCompanyCard');
  const companyNameInput = document.getElementById('feedbackCompanyName');
  const nicheInput = document.getElementById('feedbackNiche');
  const phoneInput = document.getElementById('feedbackPhone');
  const sourceSelect = document.getElementById('feedbackApiSource');
  const tokenBalance = document.getElementById('tokenBalance');
  const formFeedback = document.getElementById('leadFeedbackMessage');
  const focusForm = document.getElementById('clientFocusForm');
  const focusNiche = document.getElementById('clientFocusNiche');
  const focusCompanySize = document.getElementById('clientFocusCompanySize');
  const focusSignal = document.getElementById('clientFocusSignal');
  const focusState = document.getElementById('clientFocusState');
  const focusFeedback = document.getElementById('clientFocusMessage');
  const focusSubmit = document.getElementById('saveClientFocus');
  const focusNicheSuggestions = document.getElementById('clientFocusNicheSuggestions');
  let hasSavedFocus = false;
  const isEnglish = () => {
    try {
      return localStorage.getItem('hcp-language') === 'en-US';
    } catch {
      return false;
    }
  };
  const copy = (pt, en) => isEnglish() ? en : pt;

  const setMessage = (element, message, type = '') => {
    if (!element) return;
    element.textContent = message;
    element.className = `segment-feedback-message${type ? ` is-${type}` : ''}`;
    element.hidden = !message;
  };

  const setFocusState = (isComplete) => {
    hasSavedFocus = isComplete;
    if (!focusState) return;
    focusState.textContent = isComplete
      ? copy('Perfil definido', 'Profile defined')
      : copy('Ainda não definido', 'Not defined yet');
    focusState.classList.toggle('is-complete', isComplete);
  };

  const updateNicheSuggestions = () => {
    if (!focusNicheSuggestions) return;
    const values = isEnglish()
      ? ['Marketing Agencies', 'Sales Consulting / SDR / BDR', 'Financial BPO Companies', 'Clinics and practices', 'Accounting firms', 'Manufacturers', 'Retail']
      : ['Agências de Marketing', 'Consultorias Comerciais / SDR / BDR', 'Empresas de BPO Financeiro', 'Clínicas e consultórios', 'Escritórios contábeis', 'Indústrias', 'Varejo'];
    focusNicheSuggestions.replaceChildren(...values.map((value) => {
      const option = document.createElement('option');
      option.value = value;
      return option;
    }));
  };

  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.segmentTab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.segmentPanel !== name;
    });
    if (name === 'exchange') window.history.replaceState(null, '', '#troca-tokens');
    else if (window.location.hash === '#troca-tokens') window.history.replaceState(null, '', window.location.pathname);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.segmentTab));
  });

  if (tabs.length && panels.length) {
    const initialTab = window.location.hash === '#troca-tokens' ? 'exchange' : 'catalog';
    activateTab(initialTab);
  }

  async function loadTokenBalance() {
    if (!client || !tokenBalance) return;
    await window.hcpProfileReady;
    const { data, error } = await client
      .from('lead_source_feedback')
      .select('tokens_awarded');
    if (error) {
      tokenBalance.textContent = '—';
      return;
    }
    tokenBalance.textContent = String((data || []).reduce((sum, row) => sum + Number(row.tokens_awarded || 0), 0));
  }

  async function loadClientFocus() {
    if (!client || !focusForm) return;
    try {
      await window.hcpProfileReady;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      const user = authData?.user;
      if (!user) return;

      const { data, error } = await client
        .from('client_focus_profiles')
        .select('target_niche, company_size, opportunity_signal')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data?.target_niche || !data.company_size || !data.opportunity_signal) {
        setFocusState(false);
        return;
      }

      focusNiche.value = data.target_niche || '';
      focusCompanySize.value = data.company_size || '';
      focusSignal.value = data.opportunity_signal || '';
      setFocusState(true);
    } catch (error) {
      console.error('Não foi possível carregar o cliente foco.', error);
      setMessage(
        focusFeedback,
        copy('Não foi possível carregar suas respostas agora.', 'Could not load your answers right now.'),
        'error'
      );
    }
  }

  focusForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(focusFeedback, '');
    if (!focusForm.checkValidity()) {
      focusForm.reportValidity();
      return;
    }
    if (!client) {
      setMessage(focusFeedback, copy('A conexão com o HCP não está disponível.', 'The HCP connection is unavailable.'), 'error');
      return;
    }

    focusSubmit.disabled = true;
    focusSubmit.textContent = copy('Salvando...', 'Saving...');

    try {
      await window.hcpProfileReady;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      const user = authData?.user;
      if (!user) throw new Error('missing_user');

      const payload = {
        user_id: user.id,
        target_niche: focusNiche.value.trim(),
        company_size: focusCompanySize.value,
        opportunity_signal: focusSignal.value,
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('client_focus_profiles')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;

      setFocusState(true);
      setMessage(
        focusFeedback,
        copy(
          'Cliente foco salvo. O HCP usará essas respostas para orientar suas próximas listas.',
          'Target customer saved. HCP will use these answers to guide your next lists.'
        ),
        'success'
      );
    } catch (error) {
      console.error('Não foi possível salvar o cliente foco.', error);
      setMessage(
        focusFeedback,
        copy('Não foi possível salvar suas respostas. Tente novamente.', 'Could not save your answers. Please try again.'),
        'error'
      );
    } finally {
      focusSubmit.disabled = false;
      focusSubmit.textContent = copy('Salvar cliente foco', 'Save target customer');
    }
  });

  document.addEventListener('hcp:languagechange', () => {
    updateNicheSuggestions();
    setFocusState(hasSavedFocus);
  });

  cnpjInput?.addEventListener('input', () => {
    cnpjInput.value = cnpj.formatCnpj(cnpjInput.value);
  });

  phoneInput?.addEventListener('input', () => {
    const digits = cnpj.onlyDigits(phoneInput.value).slice(0, 11);
    if (digits.length <= 10) {
      phoneInput.value = digits.replace(/^(\d{2})(\d{0,4})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
    } else {
      phoneInput.value = digits.replace(/^(\d{2})(\d{0,5})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
    }
  });

  lookupButton?.addEventListener('click', async () => {
    const digits = cnpj.onlyDigits(cnpjInput.value);
    companyCard.hidden = true;
    setMessage(lookupFeedback, '');

    if (!cnpj.isValidCnpj(digits)) {
      setMessage(lookupFeedback, copy('Informe um CNPJ válido com 14 dígitos.', 'Enter a valid 14-digit CNPJ.'), 'error');
      cnpjInput.focus();
      return;
    }

    lookupButton.disabled = true;
    lookupButton.textContent = copy('Consultando...', 'Searching...');

    try {
      const response = await fetch(`https://open.cnpja.com/office/${digits}`, {
        headers: { Accept: 'application/json' }
      });

      if (response.status === 404) throw new Error(copy('CNPJ não encontrado na base da CNPJá.', 'CNPJ not found in CNPJá.'));
      if (response.status === 429) throw new Error(copy('Limite da CNPJá atingido. Aguarde um minuto e tente novamente.', 'CNPJá limit reached. Wait one minute and try again.'));
      if (!response.ok) throw new Error(copy('A CNPJá não conseguiu responder agora.', 'CNPJá could not respond right now.'));

      const office = cnpj.mapOffice(await response.json());
      companyNameInput.value = office.companyName;
      if (office.niche) nicheInput.value = office.niche;
      if (office.phone) {
        phoneInput.value = office.phone;
        phoneInput.dispatchEvent(new Event('input'));
      }
      sourceSelect.value = 'CNPJá';

      document.getElementById('cnpjaCompanyName').textContent = office.companyName || copy('Empresa sem razão social', 'Company without a registered name');
      document.getElementById('cnpjaCompanyMeta').textContent =
        [office.status, office.location, office.niche].filter(Boolean).join(' · ');
      companyCard.hidden = false;
      setMessage(lookupFeedback, copy('Dados encontrados e preenchidos pela API CNPJá.', 'Data found and filled in by the CNPJá API.'), 'success');
    } catch (error) {
      setMessage(lookupFeedback, error.message || copy('Não foi possível consultar o CNPJ.', 'Could not look up the CNPJ.'), 'error');
    } finally {
      lookupButton.disabled = false;
      lookupButton.textContent = copy('Consultar CNPJá', 'Search CNPJá');
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(formFeedback, '');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!cnpj.isValidCnpj(cnpjInput.value)) {
      setMessage(formFeedback, copy('Consulte um CNPJ válido antes de enviar.', 'Look up a valid CNPJ before submitting.'), 'error');
      cnpjInput.focus();
      return;
    }
    if (!client) {
      setMessage(formFeedback, copy('A conexão com o HCP não está disponível.', 'The HCP connection is unavailable.'), 'error');
      return;
    }

    const submitButton = document.getElementById('submitLeadFeedback');
    submitButton.disabled = true;
    submitButton.textContent = copy('Enviando...', 'Sending...');

    try {
      await window.hcpProfileReady;
      const payload = {
        api_source: sourceSelect.value,
        source_list: document.getElementById('feedbackSourceList').value.trim(),
        niche: nicheInput.value.trim(),
        contact_phone: cnpj.onlyDigits(phoneInput.value),
        cnpj: cnpj.onlyDigits(cnpjInput.value),
        company_name: companyNameInput.value.trim() || null,
        usefulness_score: Number(document.getElementById('feedbackUsefulness').value),
        notes: document.getElementById('feedbackNotes').value.trim() || null
      };

      const { data, error } = await client
        .from('lead_source_feedback')
        .insert(payload)
        .select('id, tokens_awarded')
        .single();
      if (error) throw error;

      setMessage(
        formFeedback,
        copy(
          `Informações registradas. Você recebeu ${data.tokens_awarded} tokens para criação de listas.`,
          `Information saved. You received ${data.tokens_awarded} tokens for list creation.`
        ),
        'success'
      );
      form.reset();
      companyCard.hidden = true;
      await loadTokenBalance();
    } catch (error) {
      setMessage(formFeedback, error.message || copy('Não foi possível registrar as informações.', 'Could not save the information.'), 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = copy('Enviar e receber 25 tokens', 'Submit and receive 25 tokens');
    }
  });

  updateNicheSuggestions();
  loadClientFocus();
  loadTokenBalance();
})();
