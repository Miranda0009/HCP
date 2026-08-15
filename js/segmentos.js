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
  const monthlyExchangeUsed = document.getElementById('monthlyExchangeUsed');
  const monthlyExchangeRemaining = document.getElementById('monthlyExchangeRemaining');
  const monthlyExchangeRenewal = document.getElementById('monthlyExchangeRenewal');
  const exchangeDateInput = document.getElementById('feedbackExchangeDate');
  const exchangeConfirmation = document.getElementById('confirmLeadExchange');
  const feedbackSubmitButton = document.getElementById('submitLeadFeedback');
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
  let monthlyLimitReached = false;
  let feedbackSubmitting = false;
  let monthlyStatus = {
    used: 0,
    remaining: 3,
    renewal: '',
    balance: 0
  };
  const isEnglish = () => {
    try {
      return localStorage.getItem('hcp-language') === 'en-US';
    } catch {
      return false;
    }
  };
  const copy = (pt, en) => isEnglish() ? en : pt;

  const saoPauloDateParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const value = (type) => parts.find((part) => part.type === type)?.value || '';
    return { year: Number(value('year')), month: Number(value('month')), day: Number(value('day')) };
  };

  const isoDate = ({ year, month, day }) => (
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

  const currentExchangeDate = () => isoDate(saoPauloDateParts());

  const currentCycleStart = () => {
    const parts = saoPauloDateParts();
    return isoDate({ ...parts, day: 1 });
  };

  const nextRenewalDate = (cycleStart = currentCycleStart()) => {
    const [year, month] = cycleStart.split('-').map(Number);
    return isoDate({
      year: month === 12 ? year + 1 : year,
      month: month === 12 ? 1 : month + 1,
      day: 1
    });
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(isEnglish() ? 'en-US' : 'pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  function syncFeedbackSubmitButton() {
    if (!feedbackSubmitButton) return;
    feedbackSubmitButton.disabled = feedbackSubmitting || monthlyLimitReached;
    if (feedbackSubmitting) {
      feedbackSubmitButton.textContent = copy('Enviando...', 'Sending...');
      return;
    }
    feedbackSubmitButton.textContent = monthlyLimitReached
      ? copy('Limite mensal atingido', 'Monthly limit reached')
      : copy('Enviar e receber 25 tokens', 'Submit and receive 25 tokens');
  }

  function renderMonthlyStatus(status = {}) {
    const used = Math.min(3, Math.max(0, Number(status.used ?? monthlyStatus.used) || 0));
    const remaining = Math.min(3, Math.max(0, Number(status.remaining ?? (3 - used)) || 0));
    const balance = Number(status.balance ?? monthlyStatus.balance) || 0;
    const renewal = status.renewal || monthlyStatus.renewal || nextRenewalDate();

    monthlyStatus = { used, remaining, balance, renewal };
    monthlyLimitReached = remaining === 0 || used >= 3;

    if (monthlyExchangeUsed) monthlyExchangeUsed.textContent = `${used} / 3`;
    if (monthlyExchangeRemaining) monthlyExchangeRemaining.textContent = String(remaining);
    if (monthlyExchangeRenewal) monthlyExchangeRenewal.textContent = formatDate(renewal);
    if (tokenBalance) tokenBalance.textContent = String(balance);
    syncFeedbackSubmitButton();
  }

  function updateMonthlyCopy() {
    const labels = {
      monthlyExchangeUsedLabel: copy('Trocas usadas no mês', 'Exchanges used this month'),
      monthlyExchangeRemainingLabel: copy('Trocas restantes', 'Exchanges remaining'),
      monthlyExchangeRenewalLabel: copy('Próxima renovação', 'Next renewal'),
      tokenBalanceLabel: copy('Seus tokens', 'Your tokens'),
      feedbackExchangeDateLabel: copy('Data da troca', 'Exchange date'),
      confirmLeadExchangeText: copy(
        'Confirmo esta troca de informações e o recebimento de 25 tokens.',
        'I confirm this information exchange and the receipt of 25 tokens.'
      )
    };
    Object.entries(labels).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    if (exchangeDateInput) exchangeDateInput.value = formatDate(currentExchangeDate());
    renderMonthlyStatus(monthlyStatus);
  }

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

  async function loadMonthlyStatus() {
    if (!client || !tokenBalance) return;
    await window.hcpProfileReady;

    try {
      const { data: memberships, error: membershipError } = await client
        .from('account_memberships')
        .select('account_id, role, created_at');
      if (membershipError) throw membershipError;
      const rolePriority = { owner: 0, admin: 1, member: 2 };
      const membership = (memberships || []).slice().sort((first, second) => {
        const roleDifference = (rolePriority[first.role] ?? 3) - (rolePriority[second.role] ?? 3);
        if (roleDifference) return roleDifference;
        return String(first.created_at || '').localeCompare(String(second.created_at || ''));
      })[0];
      if (!membership?.account_id) throw new Error('account_membership_required');

      const cycleStart = currentCycleStart();
      const [usageResult, balanceResult] = await Promise.all([
        client
          .from('monthly_exchange_usage')
          .select('used_count')
          .eq('account_id', membership.account_id)
          .eq('cycle_start', cycleStart)
          .maybeSingle(),
        client.rpc('hcp_get_token_balance')
      ]);

      if (usageResult.error) throw usageResult.error;
      if (balanceResult.error) throw balanceResult.error;

      const used = Number(usageResult.data?.used_count || 0);
      const balanceRow = Array.isArray(balanceResult.data) ? balanceResult.data[0] : balanceResult.data;
      const balance = Number(balanceRow?.token_balance || 0);
      renderMonthlyStatus({
        used,
        remaining: Math.max(0, 3 - used),
        renewal: nextRenewalDate(cycleStart),
        balance
      });
    } catch (error) {
      console.error('Não foi possível carregar os limites mensais.', error);
      if (monthlyExchangeUsed) monthlyExchangeUsed.textContent = '— / 3';
      if (monthlyExchangeRemaining) monthlyExchangeRemaining.textContent = '—';
      if (monthlyExchangeRenewal) monthlyExchangeRenewal.textContent = '—';
      if (tokenBalance) tokenBalance.textContent = '—';
      monthlyLimitReached = false;
      syncFeedbackSubmitButton();
    }
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
    updateMonthlyCopy();
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
    if (!exchangeConfirmation?.checked) {
      setMessage(
        formFeedback,
        copy('Confirme a troca de informações antes de enviar.', 'Confirm the information exchange before submitting.'),
        'error'
      );
      exchangeConfirmation?.focus();
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!cnpj.isValidCnpj(cnpjInput.value)) {
      setMessage(formFeedback, copy('Consulte um CNPJ válido antes de enviar.', 'Look up a valid CNPJ before submitting.'), 'error');
      cnpjInput.focus();
      return;
    }
    if (monthlyLimitReached) {
      setMessage(
        formFeedback,
        copy(
          `Você já utilizou as 3 trocas deste mês. A próxima renovação será em ${formatDate(monthlyStatus.renewal)}.`,
          `You have already used all 3 exchanges this month. Your next renewal is on ${formatDate(monthlyStatus.renewal)}.`
        ),
        'error'
      );
      return;
    }
    if (!client) {
      setMessage(formFeedback, copy('A conexão com o HCP não está disponível.', 'The HCP connection is unavailable.'), 'error');
      return;
    }

    feedbackSubmitting = true;
    syncFeedbackSubmitButton();

    try {
      await window.hcpProfileReady;
      const payload = {
        p_api_source: sourceSelect.value,
        p_source_list: document.getElementById('feedbackSourceList').value.trim(),
        p_niche: nicheInput.value.trim(),
        p_contact_phone: cnpj.onlyDigits(phoneInput.value),
        p_cnpj: cnpj.onlyDigits(cnpjInput.value),
        p_company_name: companyNameInput.value.trim() || null,
        p_usefulness_score: Number(document.getElementById('feedbackUsefulness').value),
        p_notes: document.getElementById('feedbackNotes').value.trim() || null,
        p_confirmed: true
      };

      const { data, error } = await client
        .rpc('hcp_submit_lead_feedback', payload);
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result) throw new Error('feedback_result_missing');

      renderMonthlyStatus({
        used: result.exchanges_used,
        remaining: result.exchanges_remaining,
        renewal: result.next_renewal,
        balance: result.token_balance
      });

      setMessage(
        formFeedback,
        copy(
          `Informações registradas. Você recebeu ${result.tokens_awarded} tokens e ainda possui ${result.exchanges_remaining} troca(s) neste mês.`,
          `Information saved. You received ${result.tokens_awarded} tokens and have ${result.exchanges_remaining} exchange(s) remaining this month.`
        ),
        'success'
      );
      form.reset();
      companyCard.hidden = true;
      if (exchangeDateInput) exchangeDateInput.value = formatDate(currentExchangeDate());
    } catch (error) {
      const errorText = `${error?.message || ''} ${error?.details || ''}`;
      if (errorText.includes('monthly_exchange_limit_reached')) {
        renderMonthlyStatus({
          used: 3,
          remaining: 0,
          renewal: monthlyStatus.renewal || nextRenewalDate()
        });
        setMessage(
          formFeedback,
          copy(
            `Você já utilizou as 3 trocas deste mês. A próxima renovação será em ${formatDate(monthlyStatus.renewal)}.`,
            `You have already used all 3 exchanges this month. Your next renewal is on ${formatDate(monthlyStatus.renewal)}.`
          ),
          'error'
        );
      } else if (errorText.includes('feedback_confirmation_required')) {
        setMessage(
          formFeedback,
          copy('Confirme a troca de informações antes de enviar.', 'Confirm the information exchange before submitting.'),
          'error'
        );
      } else if (errorText.includes('account_membership_required')) {
        setMessage(
          formFeedback,
          copy('Não foi possível localizar a conta empresarial vinculada ao seu acesso.', 'Could not find the business account linked to your access.'),
          'error'
        );
      } else {
        setMessage(
          formFeedback,
          error?.message || copy('Não foi possível registrar as informações.', 'Could not save the information.'),
          'error'
        );
      }
    } finally {
      feedbackSubmitting = false;
      syncFeedbackSubmitButton();
    }
  });

  updateNicheSuggestions();
  updateMonthlyCopy();
  loadClientFocus();
  loadMonthlyStatus();
})();
