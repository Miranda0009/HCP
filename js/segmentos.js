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
        user_count: Number(document.getElementById('feedbackUserCount').value),
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

  loadTokenBalance();
})();
