(function initializeHcpPlanBuilder(root, factory) {
  const api = factory(root);

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    root.HCPPlanBuilder = api;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function createHcpPlanBuilder(root) {
  'use strict';

  const DRAFT_KEY = 'hcp-plan-builder-draft';
  const SELECTION_KEY = 'hcp-plan-selection';
  const VERSION = 1;
  const CUSTOM_TIER = 3;

  const PLAN_RULES = Object.freeze([
    Object.freeze({
      id: 'starter',
      name: 'Starter',
      tier: 0,
      maxUsers: 1,
      maxListsPerMonth: 20,
      maxLeadsPerMonth: 2500
    }),
    Object.freeze({
      id: 'pro',
      name: 'Pro',
      tier: 1,
      maxUsers: 3,
      maxListsPerMonth: 200,
      maxLeadsPerMonth: 25000
    }),
    Object.freeze({
      id: 'business',
      name: 'Business',
      tier: 2,
      maxUsers: 10,
      maxListsPerMonth: 1000,
      maxLeadsPerMonth: 200000
    })
  ]);

  const FEATURE_RULES = Object.freeze({
    csvExport: Object.freeze({ requiredTier: 0 }),
    advancedFilters: Object.freeze({ requiredTier: 1 }),
    xlsxExport: Object.freeze({ requiredTier: 1 }),
    smartSegments: Object.freeze({ requiredTier: 1 }),
    apiIntegration: Object.freeze({ requiredTier: 2 }),
    teamWorkspace: Object.freeze({ requiredTier: 2 }),
    prioritySupport: Object.freeze({ requiredTier: 2 }),
    customDataSource: Object.freeze({ requiredTier: CUSTOM_TIER })
  });

  const DEFAULT_ANSWERS = Object.freeze({
    users: 1,
    listsPerMonth: 10,
    leadsPerMonth: 1000,
    features: Object.freeze([])
  });

  const I18N = Object.freeze({
    pt: Object.freeze({
      dialogTitle: 'Monte seu Plano',
      dialogDescription: 'Responda quatro etapas para receber uma recomendação. Os planos tradicionais continuam disponíveis.',
      close: 'Fechar Monte seu Plano',
      step: 'Etapa {current} de {total}',
      usersTitle: 'Quantas pessoas usarão o HCP?',
      usersDescription: 'A quantidade de acessos ajuda a definir a estrutura mínima da conta.',
      usersLabel: 'Número de usuários',
      usersHelp: 'Até 1 usuário: Starter · até 3: Pro · até 10: Business.',
      listsTitle: 'Quantas listas pretende exportar?',
      listsDescription: 'Considere a média de listas que sua equipe precisará por mês.',
      listsLabel: 'Listas por mês',
      listsHelp: 'Até 20 listas: Starter · até 200: Pro · até 1.000: Business.',
      leadsTitle: 'Quantos leads pretende gerar ou exportar?',
      leadsDescription: 'Informe uma estimativa mensal para dimensionar o volume da operação.',
      leadsLabel: 'Leads por mês',
      leadsHelp: 'Até 2.500 leads: Starter · até 25.000: Pro · até 200.000: Business.',
      featuresTitle: 'Quais recursos sua operação precisa?',
      featuresDescription: 'Selecione todos os recursos importantes. Recursos avançados podem elevar a recomendação.',
      featuresHelp: 'Cada recurso abaixo mostra o plano mínimo necessário.',
      recommendationTitle: 'Sua configuração recomendada',
      recommendationDescription: 'Veja como cada resposta influenciou o resultado antes de confirmar.',
      recommended: 'Recomendação',
      customName: 'Configuração personalizada',
      starterDescription: 'Essencial para uma operação individual com baixo volume mensal.',
      proDescription: 'Mais capacidade, colaboração e recursos avançados para equipes em crescimento.',
      businessDescription: 'Estrutura para alto volume, integrações e operação em equipe.',
      customDescription: 'Sua necessidade ultrapassa os limites dos planos prontos e merece uma configuração sob medida.',
      impactTitle: 'Como suas escolhas influenciaram',
      currentImpact: 'Impacto atual: a recomendação provisória é {plan}.',
      usersInfluence: '{value} usuário(s) → mínimo {plan}',
      listsInfluence: '{value} lista(s)/mês → mínimo {plan}',
      leadsInfluence: '{value} lead(s)/mês → mínimo {plan}',
      featureInfluence: '{feature} → mínimo {plan}',
      answerSummary: 'Resumo das respostas',
      usersSummary: 'Usuários',
      listsSummary: 'Listas/mês',
      leadsSummary: 'Leads/mês',
      featuresSummary: 'Recursos',
      noFeatures: 'Nenhum recurso adicional',
      continue: 'Continuar',
      showRecommendation: 'Ver recomendação',
      back: 'Voltar',
      editAnswers: 'Editar respostas',
      restart: 'Reiniciar',
      confirm: 'Confirmar configuração',
      requiredNumber: 'Informe um número válido maior que zero.',
      selectionConfirmed: 'Configuração confirmada.',
      features: Object.freeze({
        csvExport: Object.freeze({ label: 'Exportação CSV', description: 'Disponível a partir do Starter.', minimum: 'Starter' }),
        advancedFilters: Object.freeze({ label: 'Filtros avançados', description: 'Recomendado para segmentações detalhadas.', minimum: 'Pro' }),
        xlsxExport: Object.freeze({ label: 'Exportação Excel (.XLSX)', description: 'Planilhas prontas para análise e distribuição.', minimum: 'Pro' }),
        smartSegments: Object.freeze({ label: 'Segmentos inteligentes', description: 'Perfis e sinais para priorizar oportunidades.', minimum: 'Pro' }),
        apiIntegration: Object.freeze({ label: 'Integrações por API', description: 'Conecte o HCP aos sistemas da operação.', minimum: 'Business' }),
        teamWorkspace: Object.freeze({ label: 'Espaço de trabalho em equipe', description: 'Colaboração, organização e acessos compartilhados.', minimum: 'Business' }),
        prioritySupport: Object.freeze({ label: 'Suporte prioritário', description: 'Atendimento prioritário para operações críticas.', minimum: 'Business' }),
        customDataSource: Object.freeze({ label: 'Fonte de dados personalizada', description: 'Integração e configuração avaliadas sob medida.', minimum: 'Personalizado' })
      })
    }),
    en: Object.freeze({
      dialogTitle: 'Build Your Plan',
      dialogDescription: 'Complete four steps to receive a recommendation. Traditional plans remain available.',
      close: 'Close Build Your Plan',
      step: 'Step {current} of {total}',
      usersTitle: 'How many people will use HCP?',
      usersDescription: 'The number of seats helps define the minimum account structure.',
      usersLabel: 'Number of users',
      usersHelp: 'Up to 1 user: Starter · up to 3: Pro · up to 10: Business.',
      listsTitle: 'How many lists do you plan to export?',
      listsDescription: 'Consider the average number of lists your team will need each month.',
      listsLabel: 'Lists per month',
      listsHelp: 'Up to 20 lists: Starter · up to 200: Pro · up to 1,000: Business.',
      leadsTitle: 'How many leads do you plan to generate or export?',
      leadsDescription: 'Enter a monthly estimate to size your operation.',
      leadsLabel: 'Leads per month',
      leadsHelp: 'Up to 2,500 leads: Starter · up to 25,000: Pro · up to 200,000: Business.',
      featuresTitle: 'Which features does your operation need?',
      featuresDescription: 'Select every important feature. Advanced capabilities may raise the recommendation.',
      featuresHelp: 'Each feature below shows the minimum required plan.',
      recommendationTitle: 'Your recommended configuration',
      recommendationDescription: 'See how each answer influenced the result before confirming.',
      recommended: 'Recommendation',
      customName: 'Custom configuration',
      starterDescription: 'Essential for an individual operation with low monthly volume.',
      proDescription: 'More capacity, collaboration, and advanced features for growing teams.',
      businessDescription: 'Built for high volume, integrations, and team operations.',
      customDescription: 'Your needs exceed the ready-made plans and require a tailored configuration.',
      impactTitle: 'How your choices influenced the result',
      currentImpact: 'Current impact: the provisional recommendation is {plan}.',
      usersInfluence: '{value} user(s) → at least {plan}',
      listsInfluence: '{value} list(s)/month → at least {plan}',
      leadsInfluence: '{value} lead(s)/month → at least {plan}',
      featureInfluence: '{feature} → at least {plan}',
      answerSummary: 'Answer summary',
      usersSummary: 'Users',
      listsSummary: 'Lists/month',
      leadsSummary: 'Leads/month',
      featuresSummary: 'Features',
      noFeatures: 'No additional features',
      continue: 'Continue',
      showRecommendation: 'View recommendation',
      back: 'Back',
      editAnswers: 'Edit answers',
      restart: 'Start over',
      confirm: 'Confirm configuration',
      requiredNumber: 'Enter a valid number greater than zero.',
      selectionConfirmed: 'Configuration confirmed.',
      features: Object.freeze({
        csvExport: Object.freeze({ label: 'CSV export', description: 'Available from Starter.', minimum: 'Starter' }),
        advancedFilters: Object.freeze({ label: 'Advanced filters', description: 'Recommended for detailed segmentation.', minimum: 'Pro' }),
        xlsxExport: Object.freeze({ label: 'Excel export (.XLSX)', description: 'Spreadsheets ready for analysis and distribution.', minimum: 'Pro' }),
        smartSegments: Object.freeze({ label: 'Smart segments', description: 'Profiles and signals to prioritize opportunities.', minimum: 'Pro' }),
        apiIntegration: Object.freeze({ label: 'API integrations', description: 'Connect HCP to your operation systems.', minimum: 'Business' }),
        teamWorkspace: Object.freeze({ label: 'Team workspace', description: 'Collaboration, organization, and shared access.', minimum: 'Business' }),
        prioritySupport: Object.freeze({ label: 'Priority support', description: 'Priority assistance for critical operations.', minimum: 'Business' }),
        customDataSource: Object.freeze({ label: 'Custom data source', description: 'Integration and setup assessed for your needs.', minimum: 'Custom' })
      })
    })
  });

  function positiveInteger(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.max(1, Math.round(parsed));
  }

  function normalizeAnswers(input) {
    const source = input && typeof input === 'object' ? input : {};
    const features = Array.isArray(source.features)
      ? Array.from(new Set(source.features.filter((feature) => Object.prototype.hasOwnProperty.call(FEATURE_RULES, feature))))
      : [];

    return {
      users: positiveInteger(source.users, DEFAULT_ANSWERS.users),
      listsPerMonth: positiveInteger(source.listsPerMonth, DEFAULT_ANSWERS.listsPerMonth),
      leadsPerMonth: positiveInteger(source.leadsPerMonth, DEFAULT_ANSWERS.leadsPerMonth),
      features
    };
  }

  function requiredTierForMetric(value, limitKey) {
    const matchingPlan = PLAN_RULES.find((plan) => value <= plan[limitKey]);
    return matchingPlan ? matchingPlan.tier : CUSTOM_TIER;
  }

  function planIdForTier(tier) {
    return PLAN_RULES[tier]?.id || 'custom';
  }

  function planNameForTier(tier) {
    return PLAN_RULES[tier]?.name || 'Custom configuration';
  }

  function recommendPlan(input) {
    const answers = normalizeAnswers(input);
    const influences = [
      {
        kind: 'metric',
        field: 'users',
        value: answers.users,
        requiredTier: requiredTierForMetric(answers.users, 'maxUsers')
      },
      {
        kind: 'metric',
        field: 'listsPerMonth',
        value: answers.listsPerMonth,
        requiredTier: requiredTierForMetric(answers.listsPerMonth, 'maxListsPerMonth')
      },
      {
        kind: 'metric',
        field: 'leadsPerMonth',
        value: answers.leadsPerMonth,
        requiredTier: requiredTierForMetric(answers.leadsPerMonth, 'maxLeadsPerMonth')
      },
      ...answers.features.map((feature) => ({
        kind: 'feature',
        field: 'features',
        feature,
        requiredTier: FEATURE_RULES[feature].requiredTier
      }))
    ].map((influence) => ({
      ...influence,
      requiredPlanId: planIdForTier(influence.requiredTier),
      requiredPlanName: planNameForTier(influence.requiredTier)
    }));

    const tier = influences.reduce(
      (highestTier, influence) => Math.max(highestTier, influence.requiredTier),
      0
    );
    const plan = PLAN_RULES[tier] || null;

    return {
      planId: plan?.id || 'custom',
      planName: plan?.name || 'Custom configuration',
      tier,
      isCustom: !plan,
      answers,
      limits: plan ? {
        maxUsers: plan.maxUsers,
        maxListsPerMonth: plan.maxListsPerMonth,
        maxLeadsPerMonth: plan.maxLeadsPerMonth
      } : null,
      influences
    };
  }

  function safeRead(storageKey) {
    try {
      const raw = root.localStorage?.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function safeWrite(storageKey, value) {
    try {
      root.localStorage?.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function safeRemove(storageKey) {
    try {
      root.localStorage?.removeItem(storageKey);
    } catch {
      // O fluxo continua apenas em memória quando o armazenamento não está disponível.
    }
  }

  function scopedStorageKey(baseKey) {
    const userId = root.hcpCurrentUser?.id
      || root.hcpProfile?.id
      || root.hcpProfileCache?.read?.()?.userId
      || 'signup';
    return `${baseKey}:${String(userId)}`;
  }

  function readScopedWithLegacy(baseKey) {
    const scopedKey = scopedStorageKey(baseKey);
    const scopedValue = safeRead(scopedKey);
    if (scopedValue) return scopedValue;

    const legacyValue = safeRead(baseKey);
    if (!legacyValue) return null;
    safeWrite(scopedKey, legacyValue);
    safeRemove(baseKey);
    return legacyValue;
  }

  function currentLanguage() {
    if (!root.document) return 'pt';

    let storedLanguage = '';
    try {
      storedLanguage = root.localStorage?.getItem('hcp-lang')
        || root.localStorage?.getItem('hcp-language')
        || '';
    } catch {
      storedLanguage = '';
    }

    const htmlLanguage = root.document.documentElement?.lang || '';
    return String(storedLanguage || htmlLanguage).toLowerCase().startsWith('en') ? 'en' : 'pt';
  }

  function interpolate(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) => (
      Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
    ));
  }

  function getDraft() {
    const draft = readScopedWithLegacy(DRAFT_KEY);
    if (!draft || draft.version !== VERSION) return null;
    return {
      version: VERSION,
      step: Math.max(0, Math.min(4, Number(draft.step) || 0)),
      answers: normalizeAnswers(draft.answers),
      updatedAt: draft.updatedAt || null
    };
  }

  function getSelection() {
    const selection = readScopedWithLegacy(SELECTION_KEY);
    return selection?.version === VERSION ? selection : null;
  }

  const browser = {
    mounted: false,
    open: false,
    previousFocus: null,
    previousBodyOverflow: '',
    state: {
      step: 0,
      answers: normalizeAnswers(DEFAULT_ANSWERS)
    },
    elements: {}
  };

  function element(tagName, className, text) {
    const node = root.document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function ensureStyles() {
    if (!root.document || root.document.getElementById('hcp-plan-builder-styles')) return;
    const style = element('style');
    style.id = 'hcp-plan-builder-styles';
    style.textContent = `
      .hcp-pb-overlay[hidden] { display: none !important; }
      .hcp-pb-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 20px; background: rgba(3, 4, 9, .76); backdrop-filter: blur(12px); }
      .hcp-pb-dialog { width: min(760px, 100%); max-height: min(820px, calc(100dvh - 40px)); overflow: auto; border: 1px solid rgba(151, 71, 255, .38); border-radius: 22px; background: var(--card-bg, #121220); color: var(--white, #fff); box-shadow: 0 32px 100px rgba(0, 0, 0, .58), 0 0 52px rgba(151, 71, 255, .12); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .hcp-pb-header { position: relative; padding: 24px 64px 18px 26px; border-bottom: 1px solid var(--border-color, #242435); }
      .hcp-pb-header::after { position: absolute; inset: 0 0 auto; height: 2px; content: ""; background: linear-gradient(90deg, transparent, var(--purple-vivid, #9747ff), var(--purple-light, #b27df3), transparent); }
      .hcp-pb-header h2 { margin: 0 0 6px; font-size: 24px; line-height: 1.2; }
      .hcp-pb-header p { margin: 0; color: var(--gray, #77778a); font-size: 13px; line-height: 1.55; }
      .hcp-pb-close { position: absolute; top: 18px; right: 20px; display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid var(--border-color, #242435); border-radius: 10px; background: var(--bg-main, #030409); color: var(--white, #fff); cursor: pointer; font-size: 23px; line-height: 1; }
      .hcp-pb-close:hover, .hcp-pb-close:focus-visible { border-color: var(--purple-vivid, #9747ff); outline: none; }
      .hcp-pb-progress-wrap { padding: 18px 26px 0; }
      .hcp-pb-progress-copy { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; color: var(--gray, #77778a); font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
      .hcp-pb-progress { height: 5px; overflow: hidden; border-radius: 999px; background: var(--border-color, #242435); }
      .hcp-pb-progress > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--purple-vivid, #9747ff), var(--purple-light, #b27df3)); transition: width .22s ease; }
      .hcp-pb-content { padding: 26px; }
      .hcp-pb-step h3 { margin: 0 0 7px; font-size: 21px; }
      .hcp-pb-step > p { margin: 0 0 22px; color: var(--gray, #77778a); font-size: 13px; line-height: 1.55; }
      .hcp-pb-field { display: grid; gap: 9px; }
      .hcp-pb-field label { font-size: 13px; font-weight: 700; }
      .hcp-pb-input { width: 100%; height: 52px; padding: 0 15px; border: 1px solid var(--border-color, #242435); border-radius: 12px; outline: none; background: var(--bg-main, #030409); color: var(--white, #fff); font: inherit; font-size: 17px; font-weight: 650; }
      .hcp-pb-input:focus { border-color: var(--purple-vivid, #9747ff); box-shadow: 0 0 0 3px rgba(151, 71, 255, .14); }
      .hcp-pb-field small { color: var(--gray, #77778a); font-size: 11.5px; line-height: 1.5; }
      .hcp-pb-feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
      .hcp-pb-feature { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 14px; border: 1px solid var(--border-color, #242435); border-radius: 13px; background: var(--bg-main, #030409); cursor: pointer; }
      .hcp-pb-feature:hover { border-color: rgba(151, 71, 255, .58); }
      .hcp-pb-feature:has(input:checked) { border-color: var(--purple-vivid, #9747ff); background: rgba(151, 71, 255, .09); }
      .hcp-pb-feature input { width: 17px; height: 17px; margin-top: 2px; accent-color: var(--purple-vivid, #9747ff); }
      .hcp-pb-feature strong, .hcp-pb-feature small { display: block; }
      .hcp-pb-feature strong { margin-bottom: 4px; font-size: 12.5px; }
      .hcp-pb-feature small { color: var(--gray, #77778a); font-size: 10.5px; line-height: 1.4; }
      .hcp-pb-minimum { padding: 4px 7px; border-radius: 999px; background: var(--badge-bg, #221a46); color: var(--purple-light, #b27df3); font-size: 9px; font-weight: 800; white-space: nowrap; }
      .hcp-pb-impact-preview { margin-top: 20px; padding: 11px 13px; border: 1px solid rgba(151, 71, 255, .26); border-radius: 11px; background: rgba(151, 71, 255, .07); color: var(--purple-light, #b27df3); font-size: 12px; line-height: 1.45; }
      .hcp-pb-result { display: grid; gap: 16px; }
      .hcp-pb-recommendation { position: relative; overflow: hidden; padding: 20px; border: 1px solid rgba(151, 71, 255, .45); border-radius: 15px; background: linear-gradient(145deg, rgba(151, 71, 255, .15), rgba(47, 125, 255, .07)); }
      .hcp-pb-recommendation::after { position: absolute; width: 180px; height: 180px; top: -120px; right: -70px; border-radius: 50%; background: rgba(151, 71, 255, .24); filter: blur(28px); content: ""; pointer-events: none; }
      .hcp-pb-recommendation span, .hcp-pb-recommendation strong, .hcp-pb-recommendation p { position: relative; z-index: 1; display: block; }
      .hcp-pb-recommendation span { color: var(--purple-light, #b27df3); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      .hcp-pb-recommendation strong { margin: 7px 0 5px; font-size: 26px; }
      .hcp-pb-recommendation p { margin: 0; color: var(--gray, #77778a); font-size: 12.5px; line-height: 1.5; }
      .hcp-pb-result-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 12px; }
      .hcp-pb-result-card { padding: 16px; border: 1px solid var(--border-color, #242435); border-radius: 13px; background: var(--bg-main, #030409); }
      .hcp-pb-result-card h4 { margin: 0 0 12px; font-size: 13px; }
      .hcp-pb-summary, .hcp-pb-influences { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
      .hcp-pb-summary li { display: flex; justify-content: space-between; gap: 14px; color: var(--gray, #77778a); font-size: 11.5px; }
      .hcp-pb-summary strong { color: var(--white, #fff); text-align: right; }
      .hcp-pb-influences li { position: relative; padding-left: 14px; color: var(--gray, #77778a); font-size: 11.5px; line-height: 1.45; }
      .hcp-pb-influences li::before { position: absolute; left: 0; top: .48em; width: 6px; height: 6px; border-radius: 50%; background: var(--purple-vivid, #9747ff); content: ""; }
      .hcp-pb-error { margin-top: 12px; color: #ff759a; font-size: 12px; }
      .hcp-pb-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 26px 23px; border-top: 1px solid var(--border-color, #242435); }
      .hcp-pb-footer-group { display: flex; gap: 9px; }
      .hcp-pb-button { min-height: 42px; padding: 0 16px; border: 1px solid var(--border-color, #242435); border-radius: 10px; background: transparent; color: var(--white, #fff); cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
      .hcp-pb-button:hover, .hcp-pb-button:focus-visible { border-color: var(--purple-vivid, #9747ff); outline: none; }
      .hcp-pb-button-primary { border-color: transparent; background: linear-gradient(110deg, var(--purple-vivid, #9747ff), #2f68ed); color: #fff; box-shadow: 0 10px 28px rgba(85, 40, 182, .28); }
      .hcp-pb-button[hidden] { display: none; }
      @media (max-width: 640px) {
        .hcp-pb-overlay { align-items: end; padding: 0; }
        .hcp-pb-dialog { width: 100%; max-height: 94dvh; border-radius: 20px 20px 0 0; }
        .hcp-pb-header { padding: 22px 58px 16px 20px; }
        .hcp-pb-progress-wrap { padding: 16px 20px 0; }
        .hcp-pb-content { padding: 22px 20px; }
        .hcp-pb-feature-grid, .hcp-pb-result-grid { grid-template-columns: 1fr; }
        .hcp-pb-footer { align-items: stretch; flex-direction: column; padding: 15px 20px 20px; }
        .hcp-pb-footer-group { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .hcp-pb-button { width: 100%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .hcp-pb-progress > span { transition: none; }
      }
    `;
    root.document.head.appendChild(style);
  }

  function localizedPlanName(recommendation, text) {
    return recommendation.isCustom ? text.customName : recommendation.planName;
  }

  function localizedPlanNameById(planId, text) {
    return planId === 'custom' ? text.customName : (PLAN_RULES.find((plan) => plan.id === planId)?.name || text.customName);
  }

  function formatNumber(value) {
    const locale = currentLanguage() === 'en' ? 'en-US' : 'pt-BR';
    return Number(value).toLocaleString(locale);
  }

  function persistDraft() {
    safeWrite(scopedStorageKey(DRAFT_KEY), {
      version: VERSION,
      step: browser.state.step,
      answers: normalizeAnswers(browser.state.answers),
      updatedAt: new Date().toISOString()
    });
  }

  function createNumberStep(config, text) {
    const section = element('section', 'hcp-pb-step');
    section.setAttribute('role', 'group');
    section.setAttribute('aria-labelledby', `hcp-pb-${config.field}-title`);

    const heading = element('h3', '', config.title);
    heading.id = `hcp-pb-${config.field}-title`;
    section.append(heading, element('p', '', config.description));

    const field = element('div', 'hcp-pb-field');
    const label = element('label', '', config.label);
    const input = element('input', 'hcp-pb-input');
    const error = element('p', 'hcp-pb-error');
    const help = element('small', '', config.help);

    input.id = `hcp-pb-${config.field}`;
    input.type = 'number';
    input.min = '1';
    input.step = '1';
    input.required = true;
    input.inputMode = 'numeric';
    input.value = String(browser.state.answers[config.field]);
    input.setAttribute('aria-describedby', `hcp-pb-${config.field}-help hcp-pb-${config.field}-error`);
    label.htmlFor = input.id;
    help.id = `hcp-pb-${config.field}-help`;
    error.id = `hcp-pb-${config.field}-error`;
    error.hidden = true;

    input.addEventListener('input', () => {
      const value = Number(input.value);
      if (Number.isFinite(value) && value > 0) {
        browser.state.answers[config.field] = Math.round(value);
        error.hidden = true;
        input.removeAttribute('aria-invalid');
        persistDraft();
        updateImpactPreview(text);
      }
    });

    input.addEventListener('invalid', (event) => {
      event.preventDefault();
      error.textContent = text.requiredNumber;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    });

    field.append(label, input, help, error);
    section.appendChild(field);
    return section;
  }

  function createFeatureStep(text) {
    const section = element('section', 'hcp-pb-step');
    section.setAttribute('role', 'group');
    section.setAttribute('aria-labelledby', 'hcp-pb-features-title');

    const heading = element('h3', '', text.featuresTitle);
    heading.id = 'hcp-pb-features-title';
    section.append(heading, element('p', '', text.featuresDescription));

    const grid = element('div', 'hcp-pb-feature-grid');
    Object.keys(FEATURE_RULES).forEach((featureId) => {
      const featureCopy = text.features[featureId];
      const label = element('label', 'hcp-pb-feature');
      const checkbox = element('input');
      const copy = element('span');
      const title = element('strong', '', featureCopy.label);
      const description = element('small', '', featureCopy.description);
      const minimum = element('span', 'hcp-pb-minimum', featureCopy.minimum);

      checkbox.type = 'checkbox';
      checkbox.value = featureId;
      checkbox.checked = browser.state.answers.features.includes(featureId);
      checkbox.addEventListener('change', () => {
        const selected = new Set(browser.state.answers.features);
        if (checkbox.checked) selected.add(featureId);
        else selected.delete(featureId);
        browser.state.answers.features = Array.from(selected);
        persistDraft();
        updateImpactPreview(text);
      });

      copy.append(title, description);
      label.append(checkbox, copy, minimum);
      grid.appendChild(label);
    });

    section.append(grid, element('p', 'hcp-pb-impact-preview', text.featuresHelp));
    section.lastElementChild.id = 'hcp-pb-feature-help';
    return section;
  }

  function influenceText(influence, text) {
    const plan = localizedPlanNameById(influence.requiredPlanId, text);
    if (influence.kind === 'feature') {
      return interpolate(text.featureInfluence, {
        feature: text.features[influence.feature].label,
        plan
      });
    }

    const template = {
      users: text.usersInfluence,
      listsPerMonth: text.listsInfluence,
      leadsPerMonth: text.leadsInfluence
    }[influence.field];
    return interpolate(template, { value: formatNumber(influence.value), plan });
  }

  function createRecommendationStep(text) {
    const recommendation = recommendPlan(browser.state.answers);
    const section = element('section', 'hcp-pb-step hcp-pb-result');
    section.setAttribute('role', 'group');
    section.setAttribute('aria-labelledby', 'hcp-pb-result-title');

    const heading = element('h3', '', text.recommendationTitle);
    heading.id = 'hcp-pb-result-title';
    section.append(heading, element('p', '', text.recommendationDescription));

    const recommendationCard = element('div', 'hcp-pb-recommendation');
    const planName = localizedPlanName(recommendation, text);
    const descriptionKey = recommendation.isCustom ? 'customDescription' : `${recommendation.planId}Description`;
    recommendationCard.append(
      element('span', '', text.recommended),
      element('strong', '', planName),
      element('p', '', text[descriptionKey])
    );

    const resultGrid = element('div', 'hcp-pb-result-grid');
    const summaryCard = element('div', 'hcp-pb-result-card');
    const summary = element('ul', 'hcp-pb-summary');
    const summaryRows = [
      [text.usersSummary, formatNumber(recommendation.answers.users)],
      [text.listsSummary, formatNumber(recommendation.answers.listsPerMonth)],
      [text.leadsSummary, formatNumber(recommendation.answers.leadsPerMonth)],
      [
        text.featuresSummary,
        recommendation.answers.features.length
          ? recommendation.answers.features.map((feature) => text.features[feature].label).join(', ')
          : text.noFeatures
      ]
    ];
    summaryRows.forEach(([label, value]) => {
      const row = element('li');
      row.append(element('span', '', label), element('strong', '', value));
      summary.appendChild(row);
    });
    summaryCard.append(element('h4', '', text.answerSummary), summary);

    const influenceCard = element('div', 'hcp-pb-result-card');
    const influenceList = element('ul', 'hcp-pb-influences');
    recommendation.influences.forEach((influence) => {
      influenceList.appendChild(element('li', '', influenceText(influence, text)));
    });
    influenceCard.append(element('h4', '', text.impactTitle), influenceList);
    resultGrid.append(summaryCard, influenceCard);
    section.append(recommendationCard, resultGrid);
    return section;
  }

  function updateImpactPreview(text) {
    const preview = browser.elements.impactPreview;
    if (!preview) return;
    const recommendation = recommendPlan(browser.state.answers);
    preview.textContent = interpolate(text.currentImpact, {
      plan: localizedPlanName(recommendation, text)
    });
  }

  function render() {
    if (!browser.mounted) return;
    const text = I18N[currentLanguage()];
    const step = browser.state.step;
    const totalSteps = 5;
    const content = browser.elements.content;

    browser.elements.title.textContent = text.dialogTitle;
    browser.elements.description.textContent = text.dialogDescription;
    browser.elements.close.setAttribute('aria-label', text.close);
    browser.elements.progressText.textContent = interpolate(text.step, { current: step + 1, total: totalSteps });
    browser.elements.progressBar.style.width = `${((step + 1) / totalSteps) * 100}%`;
    browser.elements.progress.setAttribute('aria-valuenow', String(step + 1));
    browser.elements.progress.setAttribute('aria-valuemax', String(totalSteps));
    browser.elements.restart.textContent = text.restart;
    browser.elements.back.textContent = step === 4 ? text.editAnswers : text.back;
    browser.elements.back.hidden = step === 0;
    browser.elements.next.textContent = step === 3 ? text.showRecommendation : text.continue;
    browser.elements.next.hidden = step === 4;
    browser.elements.confirm.textContent = text.confirm;
    browser.elements.confirm.hidden = step !== 4;

    content.replaceChildren();
    browser.elements.impactPreview = null;

    if (step === 0) {
      content.appendChild(createNumberStep({
        field: 'users',
        title: text.usersTitle,
        description: text.usersDescription,
        label: text.usersLabel,
        help: text.usersHelp
      }, text));
    } else if (step === 1) {
      content.appendChild(createNumberStep({
        field: 'listsPerMonth',
        title: text.listsTitle,
        description: text.listsDescription,
        label: text.listsLabel,
        help: text.listsHelp
      }, text));
    } else if (step === 2) {
      content.appendChild(createNumberStep({
        field: 'leadsPerMonth',
        title: text.leadsTitle,
        description: text.leadsDescription,
        label: text.leadsLabel,
        help: text.leadsHelp
      }, text));
    } else if (step === 3) {
      content.appendChild(createFeatureStep(text));
    } else {
      content.appendChild(createRecommendationStep(text));
    }

    if (step < 4) {
      const preview = element('p', 'hcp-pb-impact-preview');
      preview.setAttribute('role', 'status');
      preview.setAttribute('aria-live', 'polite');
      content.appendChild(preview);
      browser.elements.impactPreview = preview;
      updateImpactPreview(text);
    }

    persistDraft();
  }

  function validateCurrentStep() {
    if (browser.state.step > 2) return true;
    const input = browser.elements.content.querySelector('.hcp-pb-input');
    if (!input) return true;
    const value = Number(input.value);
    if (!input.checkValidity() || !Number.isFinite(value) || value <= 0) {
      input.reportValidity();
      return false;
    }
    input.removeAttribute('aria-invalid');
    return true;
  }

  function focusFirstControl() {
    root.requestAnimationFrame?.(() => {
      const preferred = browser.elements.content.querySelector('input, button, select');
      (preferred || browser.elements.close).focus();
    });
  }

  function reset(options) {
    browser.state = {
      step: 0,
      answers: normalizeAnswers(options?.answers || DEFAULT_ANSWERS)
    };
    safeRemove(scopedStorageKey(DRAFT_KEY));
    if (browser.mounted) {
      render();
      if (browser.open) focusFirstControl();
    }
  }

  function close() {
    if (!browser.mounted || !browser.open) return;
    persistDraft();
    browser.open = false;
    browser.elements.overlay.hidden = true;
    browser.elements.overlay.setAttribute('aria-hidden', 'true');
    root.document.body.style.overflow = browser.previousBodyOverflow;
    browser.previousFocus?.focus?.();
    browser.previousFocus = null;
  }

  function confirmSelection() {
    const recommendation = recommendPlan(browser.state.answers);
    const detail = {
      version: VERSION,
      source: 'hcp-plan-builder',
      locale: currentLanguage() === 'en' ? 'en-US' : 'pt-BR',
      confirmedAt: new Date().toISOString(),
      answers: recommendation.answers,
      recommendation
    };

    safeWrite(scopedStorageKey(SELECTION_KEY), detail);
    safeWrite(scopedStorageKey(DRAFT_KEY), {
      version: VERSION,
      step: 4,
      status: 'confirmed',
      answers: recommendation.answers,
      updatedAt: detail.confirmedAt
    });

    if (typeof root.CustomEvent === 'function') {
      root.dispatchEvent(new root.CustomEvent('hcp:plan-selected', { detail }));
    }
    close();
    return detail;
  }

  function trapDialogFocus(event) {
    if (!browser.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(browser.elements.dialog.querySelectorAll(
      'button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), select:not([hidden]):not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )).filter((node) => node.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && root.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && root.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function mount() {
    if (!root.document || browser.mounted) return api;
    ensureStyles();

    const overlay = element('div', 'hcp-pb-overlay');
    const dialog = element('div', 'hcp-pb-dialog');
    const header = element('header', 'hcp-pb-header');
    const title = element('h2');
    const description = element('p');
    const closeButton = element('button', 'hcp-pb-close', '×');
    const progressWrap = element('div', 'hcp-pb-progress-wrap');
    const progressCopy = element('div', 'hcp-pb-progress-copy');
    const progressText = element('span');
    const progress = element('div', 'hcp-pb-progress');
    const progressBar = element('span');
    const content = element('div', 'hcp-pb-content');
    const footer = element('footer', 'hcp-pb-footer');
    const restartButton = element('button', 'hcp-pb-button');
    const footerActions = element('div', 'hcp-pb-footer-group');
    const backButton = element('button', 'hcp-pb-button');
    const nextButton = element('button', 'hcp-pb-button hcp-pb-button-primary');
    const confirmButton = element('button', 'hcp-pb-button hcp-pb-button-primary');

    overlay.id = 'hcp-plan-builder';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'hcp-pb-title');
    dialog.setAttribute('aria-describedby', 'hcp-pb-description');
    dialog.tabIndex = -1;
    title.id = 'hcp-pb-title';
    description.id = 'hcp-pb-description';
    closeButton.type = 'button';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '1');
    [restartButton, backButton, nextButton, confirmButton].forEach((button) => {
      button.type = 'button';
    });

    progressCopy.append(progressText);
    progress.append(progressBar);
    progressWrap.append(progressCopy, progress);
    header.append(title, description, closeButton);
    footerActions.append(backButton, nextButton, confirmButton);
    footer.append(restartButton, footerActions);
    dialog.append(header, progressWrap, content, footer);
    overlay.appendChild(dialog);
    root.document.body.appendChild(overlay);

    browser.elements = {
      overlay,
      dialog,
      title,
      description,
      close: closeButton,
      progress,
      progressText,
      progressBar,
      content,
      restart: restartButton,
      back: backButton,
      next: nextButton,
      confirm: confirmButton,
      impactPreview: null
    };
    browser.mounted = true;

    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    dialog.addEventListener('keydown', trapDialogFocus);
    restartButton.addEventListener('click', () => reset());
    backButton.addEventListener('click', () => {
      browser.state.step = browser.state.step === 4 ? 0 : Math.max(0, browser.state.step - 1);
      render();
      focusFirstControl();
    });
    nextButton.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      browser.state.step = Math.min(4, browser.state.step + 1);
      render();
      focusFirstControl();
    });
    confirmButton.addEventListener('click', confirmSelection);
    return api;
  }

  function open(options) {
    if (!root.document) return api;
    mount();
    const requestedAnswers = options?.answers;
    const shouldReset = Boolean(options?.reset);
    const draft = !shouldReset && !requestedAnswers ? getDraft() : null;

    browser.state = {
      step: requestedAnswers ? 0 : (draft?.step || 0),
      answers: normalizeAnswers(requestedAnswers || draft?.answers || DEFAULT_ANSWERS)
    };
    browser.previousFocus = root.document.activeElement;
    browser.previousBodyOverflow = root.document.body.style.overflow;
    browser.open = true;
    browser.elements.overlay.hidden = false;
    browser.elements.overlay.setAttribute('aria-hidden', 'false');
    root.document.body.style.overflow = 'hidden';
    render();
    focusFirstControl();
    return api;
  }

  const api = {
    VERSION,
    DRAFT_KEY,
    SELECTION_KEY,
    PLAN_RULES,
    FEATURE_RULES,
    DEFAULT_ANSWERS,
    normalizeAnswers,
    recommendPlan,
    getDraft,
    getSelection,
    mount,
    open,
    close,
    reset,
    confirmSelection
  };

  if (root.document) {
    const initializeBrowserBindings = () => {
      mount();
      root.document.addEventListener('click', (event) => {
        const trigger = event.target.closest?.('[data-hcp-plan-builder], [data-plan-builder]');
        if (!trigger) return;
        event.preventDefault();
        open();
      });
      root.document.addEventListener('hcp:open-plan-builder', (event) => open(event.detail || {}));
      root.document.addEventListener('hcp:languagechange', () => {
        if (browser.open) render();
      });
    };

    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', initializeBrowserBindings, { once: true });
    } else {
      initializeBrowserBindings();
    }
  }

  return api;
});
