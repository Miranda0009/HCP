const HCP_LEAD_QUANTITIES = Object.freeze([50, 100, 150, 200, 250, 300]);
const HCP_LEAD_UFS = Object.freeze([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]);

const HCP_CITY_BY_UF = Object.freeze({
  AC: 'Rio Branco', AL: 'Maceió', AP: 'Macapá', AM: 'Manaus', BA: 'Salvador', CE: 'Fortaleza',
  DF: 'Brasília', ES: 'Vitória', GO: 'Goiânia', MA: 'São Luís', MT: 'Cuiabá', MS: 'Campo Grande',
  MG: 'Belo Horizonte', PA: 'Belém', PB: 'João Pessoa', PR: 'Curitiba', PE: 'Recife', PI: 'Teresina',
  RJ: 'Rio de Janeiro', RN: 'Natal', RS: 'Porto Alegre', RO: 'Porto Velho', RR: 'Boa Vista',
  SC: 'Florianópolis', SP: 'São Paulo', SE: 'Aracaju', TO: 'Palmas'
});

const HCP_KNOWN_CITY_STATES = Object.freeze({
  'aracaju': 'SE', 'belem': 'PA', 'belo horizonte': 'MG', 'boa vista': 'RR', 'brasilia': 'DF',
  'campinas': 'SP', 'campo grande': 'MS', 'cuiaba': 'MT', 'curitiba': 'PR', 'florianopolis': 'SC',
  'fortaleza': 'CE', 'goiania': 'GO', 'joao pessoa': 'PB', 'macapa': 'AP', 'maceio': 'AL',
  'manaus': 'AM', 'natal': 'RN', 'palmas': 'TO', 'porto alegre': 'RS', 'porto velho': 'RO',
  'recife': 'PE', 'ribeirao preto': 'SP', 'rio branco': 'AC', 'rio de janeiro': 'RJ', 'salvador': 'BA',
  'santos': 'SP', 'sao luis': 'MA', 'sao paulo': 'SP', 'teresina': 'PI', 'vitoria': 'ES'
});

const HCP_SIZE_LABELS = Object.freeze({
  micro: 'Microempresa', small: 'Pequena', medium: 'Média', large: 'Grande'
});
const HCP_STATUS_LABELS = Object.freeze({ active: 'Ativa', inactive: 'Inativa' });
const HCP_TYPE_LABELS = Object.freeze({
  mei: 'MEI', ltda: 'Sociedade Limitada', sa: 'Sociedade Anônima', individual: 'Empresário Individual'
});

const HCP_COMPANY_PREFIXES = Object.freeze([
  'Alfa', 'Aurora', 'Conecta', 'Evolua', 'Horizonte', 'Impulso', 'Integra', 'Nexo', 'Órbita', 'Pioneira',
  'Prime', 'Prisma', 'Vértice', 'Visão', 'Avança', 'Central', 'Dinamiza', 'Essencial', 'Fortis', 'Inova'
]);
const HCP_COMPANY_SUFFIXES = Object.freeze([
  'Brasil', 'Soluções', 'Negócios', 'Participações', 'Serviços', 'Hub', 'Group', 'Digital', 'Comercial', 'Empresarial'
]);

const HCP_EXPORT_COLUMNS = Object.freeze([
  ['Empresa', 'name'], ['CNPJ', 'cnpj'], ['Nicho', 'niche'], ['Cidade', 'city'], ['UF', 'state'],
  ['Telefone', 'phone'], ['E-mail', 'email'], ['Site', 'site'], ['Porte', 'size'], ['Situação', 'status'],
  ['Tipo', 'type'], ['Avaliação', 'rating'], ['Quantidade de avaliações', 'reviews'], ['Fonte', 'source']
]);
const HCP_FAVORITE_LEAD_LISTS_BASE_KEY = 'hcp-favorite-lead-lists';

const HCP_LEAD_MESSAGES = Object.freeze({
  'pt-BR': Object.freeze({
    nicheMin: 'Informe um nicho ou segmento com pelo menos 2 caracteres.',
    nicheMax: 'O nicho deve ter no máximo 120 caracteres.',
    cityInvalid: 'Informe uma cidade válida ou deixe o campo em branco.',
    cityMax: 'A cidade deve ter no máximo 80 caracteres.',
    stateInvalid: 'Selecione um estado válido.',
    cityNeedsState: ({ city }) => `Não foi possível identificar a UF de “${city}”. Selecione o estado para continuar.`,
    cityStateMismatch: ({ city, expectedState, selectedState }) => `A cidade “${city}” pertence a ${expectedState}, mas o estado selecionado é ${selectedState}.`,
    quantityInvalid: 'Escolha uma quantidade entre 50 e 300, em intervalos de 50.',
    generationCreditsInsufficient: ({ quantity }) => `Créditos insuficientes: são necessários ${quantity} créditos para gerar esta lista.`,
    creditBalanceInvalid: 'Saldo de créditos inválido.',
    creditAmountInvalid: 'Quantidade de créditos inválida.',
    creditConsumeInsufficient: 'Créditos insuficientes para gerar esta lista.',
    creditLoading: 'Consultando seu saldo de créditos...',
    creditLoadFailure: 'Não foi possível consultar seus créditos agora. Recarregue a página e tente novamente.',
    creditMembershipRequired: 'Sua conta ainda não possui um espaço de trabalho válido para usar créditos.',
    creditRequestConflict: 'Esta solicitação já foi usada com outra quantidade. Tente gerar a lista novamente.',
    balanceInsufficient: 'Saldo insuficiente',
    resultsInitial: 'Gere uma lista para visualizar e selecionar os leads.',
    resultsSummary: ({ total, selected }) => `${total} leads encontrados · ${selected} selecionados`,
    resultsEmpty: 'Nenhuma lista gerada até o momento.',
    generationIncomplete: ({ quantity }) => `Não foi possível completar ${quantity} leads com os filtros informados. Ajuste os filtros e tente novamente.`,
    generationSuccess: ({ count }) => `${count} leads completos e sem duplicações foram gerados. Selecione os desejados para salvar ou exportar.`,
    generationFallback: 'Não foi possível gerar a lista. Revise os critérios e tente novamente.',
    generating: 'Gerando...',
    generate: 'Gerar lista',
    saveNameRequired: 'Informe um nome com pelo menos 2 caracteres antes de salvar a lista.',
    saveSelectionRequired: 'Selecione pelo menos um lead para salvar.',
    saveStorageError: 'Não foi possível salvar a lista neste dispositivo. Verifique o espaço disponível.',
    saveSuccess: ({ name, count }) => `Lista “${name}” salva neste dispositivo com ${count} leads.`,
    exportSelectionRequired: 'Selecione pelo menos um lead antes de exportar.',
    csvSuccess: ({ count }) => `CSV criado com ${count} leads selecionados.`,
    csvFailure: 'Não foi possível criar ou compartilhar o arquivo CSV. Tente exportar novamente.',
    xlsxUnavailable: 'O exportador Excel não foi carregado. Verifique sua conexão e tente novamente.',
    xlsxSuccess: ({ count }) => `Excel criado com ${count} leads selecionados.`,
    xlsxFailure: 'Não foi possível criar o arquivo Excel. Tente exportar novamente.',
    exportShareTitle: 'Lista de leads HCP',
    exportShareDialog: 'Salvar ou compartilhar lista',
    listLoaded: ({ name }) => `Lista “${name}” carregada com sucesso.`
  }),
  'en-US': Object.freeze({
    nicheMin: 'Enter a niche or segment with at least 2 characters.',
    nicheMax: 'The niche must contain no more than 120 characters.',
    cityInvalid: 'Enter a valid city or leave the field blank.',
    cityMax: 'The city must contain no more than 80 characters.',
    stateInvalid: 'Select a valid state.',
    cityNeedsState: ({ city }) => `We could not identify the state for “${city}”. Select the state to continue.`,
    cityStateMismatch: ({ city, expectedState, selectedState }) => `The city “${city}” belongs to ${expectedState}, but the selected state is ${selectedState}.`,
    quantityInvalid: 'Choose a quantity between 50 and 300, in increments of 50.',
    generationCreditsInsufficient: ({ quantity }) => `Insufficient credits: ${quantity} credits are required to generate this list.`,
    creditBalanceInvalid: 'Invalid credit balance.',
    creditAmountInvalid: 'Invalid credit amount.',
    creditConsumeInsufficient: 'Insufficient credits to generate this list.',
    creditLoading: 'Checking your credit balance...',
    creditLoadFailure: 'We could not check your credits right now. Reload the page and try again.',
    creditMembershipRequired: 'Your account does not yet have a valid workspace for using credits.',
    creditRequestConflict: 'This request was already used with a different amount. Generate the list again.',
    balanceInsufficient: 'Insufficient balance',
    resultsInitial: 'Generate a list to view and select leads.',
    resultsSummary: ({ total, selected }) => `${total} leads found · ${selected} selected`,
    resultsEmpty: 'No list has been generated yet.',
    generationIncomplete: ({ quantity }) => `We could not complete ${quantity} leads with the selected filters. Adjust the filters and try again.`,
    generationSuccess: ({ count }) => `${count} complete, duplicate-free leads were generated. Select the leads you want to save or export.`,
    generationFallback: 'We could not generate the list. Review the criteria and try again.',
    generating: 'Generating...',
    generate: 'Generate list',
    saveNameRequired: 'Enter a name with at least 2 characters before saving the list.',
    saveSelectionRequired: 'Select at least one lead to save.',
    saveStorageError: 'We could not save the list on this device. Check the available storage.',
    saveSuccess: ({ name, count }) => `List “${name}” saved on this device with ${count} leads.`,
    exportSelectionRequired: 'Select at least one lead before exporting.',
    csvSuccess: ({ count }) => `CSV created with ${count} selected leads.`,
    csvFailure: 'We could not create or share the CSV file. Try exporting it again.',
    xlsxUnavailable: 'The Excel exporter could not be loaded. Check your connection and try again.',
    xlsxSuccess: ({ count }) => `Excel file created with ${count} selected leads.`,
    xlsxFailure: 'We could not create the Excel file. Try exporting it again.',
    exportShareTitle: 'HCP lead list',
    exportShareDialog: 'Save or share list',
    listLoaded: ({ name }) => `List “${name}” loaded successfully.`
  })
});

function normalizeLeadLanguage(language) {
  return language === 'en-US' ? 'en-US' : 'pt-BR';
}

function getLeadMessage(key, language = 'pt-BR', parameters = {}) {
  const dictionary = HCP_LEAD_MESSAGES[normalizeLeadLanguage(language)];
  const entry = dictionary[key] ?? HCP_LEAD_MESSAGES['pt-BR'][key] ?? '';
  return typeof entry === 'function' ? entry(parameters) : entry;
}

function resolveInitialLeadCredits(storedValue, initialCredits = 1000) {
  if (storedValue === null || storedValue === undefined || String(storedValue).trim() === '') return initialCredits;
  const value = Number(storedValue);
  return Number.isFinite(value) && value >= 0 ? value : initialCredits;
}

function readLeadNicheFromSearch(search = '') {
  try {
    return String(new URLSearchParams(String(search)).get('nicho') || '').trim().slice(0, 120);
  } catch {
    return '';
  }
}

function favoriteLeadListsStorageKey(userId, baseKey = HCP_FAVORITE_LEAD_LISTS_BASE_KEY) {
  const normalizedUserId = String(userId || '').trim();
  return `${baseKey}:${normalizedUserId || 'unavailable'}`;
}

function resolveLeadListUserId(runtime = {}, readyProfile = null) {
  return String(
    runtime.hcpCurrentUser?.id
    || runtime.hcpProfile?.id
    || readyProfile?.id
    || ''
  ).trim();
}

function parseStoredLeadLists(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function mergeStoredLeadLists(scopedLists = [], legacyLists = []) {
  const seen = new Set();
  return [...scopedLists, ...legacyLists].filter((list) => {
    const identity = String(list?.id || '').trim() || JSON.stringify(list);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function migrateLegacyFavoriteLeadLists(storage, userId, baseKey = HCP_FAVORITE_LEAD_LISTS_BASE_KEY) {
  const scopedKey = favoriteLeadListsStorageKey(userId, baseKey);
  if (!storage || !String(userId || '').trim()) return scopedKey;

  try {
    const legacyRaw = storage.getItem(baseKey);
    if (legacyRaw === null) return scopedKey;

    const scopedRaw = storage.getItem(scopedKey);
    const legacyLists = parseStoredLeadLists(legacyRaw);
    const scopedLists = parseStoredLeadLists(scopedRaw);
    let nextRaw = scopedRaw;

    if (legacyLists && scopedLists) nextRaw = JSON.stringify(mergeStoredLeadLists(scopedLists, legacyLists));
    else if (legacyLists) nextRaw = JSON.stringify(legacyLists);
    else if (scopedRaw === null) nextRaw = legacyRaw;

    if (nextRaw !== scopedRaw) storage.setItem(scopedKey, nextRaw);
    storage.removeItem(baseKey);
  } catch {
    // Se a migração falhar, a chave legada é preservada para uma nova tentativa segura.
  }

  return scopedKey;
}

function normalizeLeadText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function hashLeadSeed(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickLeadValue(values, seed, index, salt) {
  const position = (seed + Math.imul(index + 1, salt)) >>> 0;
  return values[position % values.length];
}

function calculateCnpjDigit(base) {
  const weights = base.length === 12
    ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const total = base.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
  const remainder = total % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function createDeterministicCnpj(seed, index) {
  const rootNumber = ((seed % 99900000) + 100000 + Math.imul(index + 1, 7919)) % 100000000;
  const base = String(rootNumber).padStart(8, '0') + '0001';
  const firstDigit = calculateCnpjDigit(base);
  const secondDigit = calculateCnpjDigit(base + firstDigit);
  return base + firstDigit + secondDigit;
}

function formatLeadCnpj(value) {
  const digits = String(value || '').replace(/\D/g, '').padStart(14, '0').slice(-14);
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function leadSlug(value) {
  return normalizeLeadText(value).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'empresa';
}

function inferStateFromCity(city) {
  return HCP_KNOWN_CITY_STATES[normalizeLeadText(city)] || null;
}

function normalizeLeadFilters(filters = {}) {
  return {
    size: ['any', 'micro', 'small', 'medium', 'large'].includes(filters.size) ? filters.size : 'any',
    status: ['any', 'active', 'inactive'].includes(filters.status) ? filters.status : 'active',
    type: ['any', 'mei', 'ltda', 'sa', 'individual'].includes(filters.type) ? filters.type : 'any',
    website: ['any', 'with', 'without'].includes(filters.website) ? filters.website : 'any'
  };
}

function validateLeadGeneration(criteria = {}, availableCredits = Infinity, language = 'pt-BR') {
  const errorDetails = [];
  const niche = String(criteria.niche || '').trim();
  const city = String(criteria.city || '').trim();
  const state = String(criteria.state || 'ALL').toUpperCase();
  const quantity = Number(criteria.quantity);
  const inferredState = city ? inferStateFromCity(city) : null;
  const validSelectedState = state === 'ALL' || HCP_LEAD_UFS.includes(state);
  const addError = (key, parameters = {}) => errorDetails.push({ key, parameters });

  if (niche.length < 2) addError('nicheMin');
  if (niche.length > 120) addError('nicheMax');
  if (city && city.length < 2) addError('cityInvalid');
  if (city.length > 80) addError('cityMax');
  if (!validSelectedState) addError('stateInvalid');
  if (city.length >= 2 && city.length <= 80 && state === 'ALL' && !inferredState) {
    addError('cityNeedsState', { city });
  }
  if (city.length >= 2 && city.length <= 80 && state !== 'ALL' && validSelectedState && inferredState && inferredState !== state) {
    addError('cityStateMismatch', { city, expectedState: inferredState, selectedState: state });
  }
  if (!HCP_LEAD_QUANTITIES.includes(quantity)) addError('quantityInvalid');
  if (Number.isFinite(Number(availableCredits)) && Number(availableCredits) < quantity) {
    addError('generationCreditsInsufficient', { quantity });
  }

  return {
    valid: errorDetails.length === 0,
    errors: errorDetails.map(({ key, parameters }) => getLeadMessage(key, language, parameters)),
    errorDetails,
    criteria: { niche, city, state, quantity, filters: normalizeLeadFilters(criteria.filters) }
  };
}

function leadHasWebsite(lead) {
  const site = normalizeLeadText(lead?.site);
  return Boolean(site && site !== 'sem site' && site !== 'nao informado');
}

function filterLeads(leads, criteria = {}) {
  const niche = normalizeLeadText(criteria.niche);
  const city = normalizeLeadText(criteria.city);
  const state = String(criteria.state || 'ALL').toUpperCase();
  const filters = normalizeLeadFilters(criteria.filters);

  return (Array.isArray(leads) ? leads : []).filter((lead) => {
    const leadNiche = normalizeLeadText(lead.niche);
    if (niche && !leadNiche.includes(niche) && !niche.includes(leadNiche)) return false;
    if (city && normalizeLeadText(lead.city) !== city) return false;
    if (state !== 'ALL' && String(lead.state || '').toUpperCase() !== state) return false;
    if (filters.size !== 'any' && lead.sizeCode !== filters.size) return false;
    if (filters.status !== 'any' && lead.statusCode !== filters.status) return false;
    if (filters.type !== 'any' && lead.typeCode !== filters.type) return false;
    if (filters.website === 'with' && !leadHasWebsite(lead)) return false;
    if (filters.website === 'without' && leadHasWebsite(lead)) return false;
    return true;
  });
}

function isCompleteLead(lead) {
  const cnpj = String(lead?.cnpj || '').replace(/\D/g, '');
  const phone = String(lead?.phone || '').replace(/\D/g, '');
  return Boolean(
    String(lead?.id || '').trim()
    && String(lead?.name || '').trim()
    && cnpj.length === 14
    && String(lead?.niche || '').trim()
    && String(lead?.city || '').trim()
    && HCP_LEAD_UFS.includes(String(lead?.state || '').toUpperCase())
    && phone.length >= 10
    && String(lead?.email || '').includes('@')
    && String(lead?.site || '').trim()
    && String(lead?.size || '').trim()
    && String(lead?.status || '').trim()
    && String(lead?.type || '').trim()
    && Number.isFinite(Number(lead?.rating))
    && Number.isFinite(Number(lead?.reviews))
    && String(lead?.source || '').trim()
  );
}

function dedupeLeads(leads) {
  const seenKeys = new Set();
  const unique = [];

  (Array.isArray(leads) ? leads : []).forEach((lead) => {
    const cnpj = String(lead?.cnpj || '').replace(/\D/g, '');
    const phone = String(lead?.phone || '').replace(/\D/g, '');
    const domain = normalizeLeadText(lead?.site).replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    const identity = [normalizeLeadText(lead?.name), normalizeLeadText(lead?.city), String(lead?.state || '').toUpperCase()].join('|');
    const keys = [];
    if (cnpj.length === 14) keys.push(`cnpj:${cnpj}`);
    if (phone.length >= 10) keys.push(`phone:${phone}`);
    if (domain && domain !== 'sem site' && domain !== 'nao informado') keys.push(`site:${domain}`);
    if (identity !== '||') keys.push(`identity:${identity}`);

    if (keys.some((key) => seenKeys.has(key))) return;
    keys.forEach((key) => seenKeys.add(key));
    unique.push(lead);
  });

  return unique;
}

function generateLeads(criteria = {}) {
  const validation = validateLeadGeneration(criteria);
  if (!validation.valid) return [];

  const normalized = validation.criteria;
  const { filters } = normalized;
  const seed = hashLeadSeed(JSON.stringify(normalized));
  const requestedQuantity = normalized.quantity;
  const candidates = [];
  const nicheWords = normalized.niche.split(/\s+/).slice(0, 3).join(' ');
  const inferredState = normalized.city && normalized.state === 'ALL' ? inferStateFromCity(normalized.city) : null;
  const sizes = Object.keys(HCP_SIZE_LABELS);
  const statuses = Object.keys(HCP_STATUS_LABELS);
  const types = Object.keys(HCP_TYPE_LABELS);

  for (let index = 0; index < requestedQuantity * 2; index += 1) {
    const state = normalized.state !== 'ALL'
      ? normalized.state
      : (inferredState || HCP_LEAD_UFS[(seed + index) % HCP_LEAD_UFS.length]);
    const city = normalized.city || HCP_CITY_BY_UF[state];
    const sizeCode = filters.size === 'any' ? pickLeadValue(sizes, seed, index, 17) : filters.size;
    const statusCode = filters.status === 'any' ? pickLeadValue(statuses, seed, index, 19) : filters.status;
    const typeCode = filters.type === 'any' ? pickLeadValue(types, seed, index, 23) : filters.type;
    const hasWebsite = filters.website === 'with'
      ? true
      : (filters.website === 'without' ? false : ((seed + index) % 3 !== 0));
    const prefix = pickLeadValue(HCP_COMPANY_PREFIXES, seed, index, 29);
    const suffix = pickLeadValue(HCP_COMPANY_SUFFIXES, seed, index, 31);
    const name = `${prefix} ${nicheWords} ${suffix} ${String(index + 1).padStart(3, '0')}`;
    const domain = `${leadSlug(prefix)}-${leadSlug(nicheWords)}-${index + 1}.com.br`;
    const cnpj = createDeterministicCnpj(seed, index);
    const area = String(11 + ((seed + index) % 79)).padStart(2, '0');
    const phoneBody = String(900000000 + ((seed + Math.imul(index + 1, 3571)) % 99999999)).slice(0, 9);

    candidates.push({
      id: `lead-${cnpj}`,
      name,
      cnpj,
      niche: normalized.niche,
      city,
      state,
      phone: `${area}${phoneBody}`,
      email: `contato${index + 1}@${domain}`,
      site: hasWebsite ? `https://www.${domain}` : 'Sem site',
      sizeCode,
      size: HCP_SIZE_LABELS[sizeCode],
      statusCode,
      status: HCP_STATUS_LABELS[statusCode],
      typeCode,
      type: HCP_TYPE_LABELS[typeCode],
      rating: Number((2.5 + ((seed + index * 7) % 26) / 10).toFixed(1)),
      reviews: 10 + ((seed + index * 41) % 490),
      source: 'HCP — geração determinística de testes'
    });
  }

  return dedupeLeads(filterLeads(candidates, normalized).filter(isCompleteLead)).slice(0, requestedQuantity);
}

function consumeLeadCredits(balance, amount, language = 'pt-BR') {
  const available = Number(balance);
  const requested = Number(amount);
  if (!Number.isFinite(available) || available < 0) {
    return { ok: false, consumed: 0, remaining: available, error: getLeadMessage('creditBalanceInvalid', language) };
  }
  if (!Number.isInteger(requested) || requested <= 0) {
    return { ok: false, consumed: 0, remaining: available, error: getLeadMessage('creditAmountInvalid', language) };
  }
  if (available < requested) {
    return { ok: false, consumed: 0, remaining: available, error: getLeadMessage('creditConsumeInsufficient', language) };
  }
  return { ok: true, consumed: requested, remaining: available - requested, error: null };
}

function createLeadRequestId(runtime = globalThis) {
  if (typeof runtime?.crypto?.randomUUID === 'function') return runtime.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (typeof runtime?.crypto?.getRandomValues === 'function') runtime.crypto.getRandomValues(bytes);
  else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

function leadCreditErrorMessage(error) {
  const message = String(error?.message || error?.details || error?.hint || '').toLowerCase();
  if (message.includes('insufficient_lead_credits')) return 'creditConsumeInsufficient';
  if (message.includes('account_membership_required') || message.includes('authenticated_user_required')) {
    return 'creditMembershipRequired';
  }
  if (message.includes('lead_credit_request_conflict')) return 'creditRequestConflict';
  if (message.includes('lead_credit_quantity_invalid')) return 'creditAmountInvalid';
  return 'creditLoadFailure';
}

function shouldDisableLeadGeneration(state = {}) {
  return Boolean(state.generationPending || !state.creditReady);
}

function safeSpreadsheetValue(value) {
  const text = String(value ?? '');
  return /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function leadToExportRow(lead) {
  return Object.fromEntries(HCP_EXPORT_COLUMNS.map(([label, key]) => {
    let value = lead?.[key] ?? '';
    if (key === 'cnpj') value = formatLeadCnpj(value);
    if (key === 'phone') {
      const digits = String(value).replace(/\D/g, '').slice(0, 11);
      value = digits.length === 11
        ? digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
        : digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return [label, typeof value === 'number' ? value : safeSpreadsheetValue(value)];
  }));
}

function leadsToXlsxData(leads) {
  return (Array.isArray(leads) ? leads : []).map(leadToExportRow);
}

function escapeCsvValue(value) {
  const text = safeSpreadsheetValue(value).replace(/"/g, '""');
  return /[",\r\n]/.test(text) ? `"${text}"` : text;
}

function leadsToCsv(leads) {
  const rows = leadsToXlsxData(leads);
  const headers = HCP_EXPORT_COLUMNS.map(([label]) => label);
  const lines = [headers.map(escapeCsvValue).join(',')];
  rows.forEach((row) => lines.push(headers.map((header) => escapeCsvValue(row[header])).join(',')));
  return `\uFEFF${lines.join('\r\n')}`;
}

function isNativeLeadExportRuntime(runtime = globalThis) {
  const capacitor = runtime?.Capacitor;
  if (!capacitor) return false;
  if (typeof capacitor.isNativePlatform === 'function') return Boolean(capacitor.isNativePlatform());
  if (typeof capacitor.getPlatform === 'function') return capacitor.getPlatform() !== 'web';
  return false;
}

function nativeLeadExportPlugins(runtime = globalThis) {
  if (!isNativeLeadExportRuntime(runtime)) return null;
  const filesystem = runtime.Capacitor?.Plugins?.Filesystem;
  const share = runtime.Capacitor?.Plugins?.Share;
  if (typeof filesystem?.writeFile !== 'function' || typeof share?.share !== 'function') return null;
  return { filesystem, share };
}

function buildNativeLeadExportPath(filename, now = Date.now()) {
  const sanitized = String(filename || 'lista-hcp')
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '-')
    .replace(/^\.+/, '')
    .replace(/^-+/, '')
    .slice(0, 120) || 'lista-hcp';
  const timestamp = Number.isFinite(Number(now)) ? Math.max(0, Math.trunc(Number(now))) : Date.now();
  return `hcp-exports/${timestamp}-${sanitized}`;
}

async function shareNativeLeadExport(runtime, options = {}) {
  const plugins = nativeLeadExportPlugins(runtime);
  if (!plugins) return { handled: false };

  if (typeof plugins.share.canShare === 'function') {
    const capability = await plugins.share.canShare();
    if (capability?.value === false) return { handled: false };
  }

  const path = buildNativeLeadExportPath(options.filename, options.now);
  const writeOptions = {
    path,
    data: String(options.data ?? ''),
    directory: 'CACHE',
    recursive: true
  };
  if (options.encoding) writeOptions.encoding = options.encoding;

  const written = await plugins.filesystem.writeFile(writeOptions);
  let uri = written?.uri;
  if (!uri && typeof plugins.filesystem.getUri === 'function') {
    uri = (await plugins.filesystem.getUri({ path, directory: 'CACHE' }))?.uri;
  }
  if (!uri) throw new Error('native_lead_export_uri_missing');

  await plugins.share.share({
    title: options.title || options.filename || 'HCP',
    files: [uri],
    dialogTitle: options.dialogTitle || options.title || 'HCP'
  });
  return { handled: true, path, uri };
}

async function initializeLeadGenerator() {
  const form = document.getElementById('leadGenerationForm');
  if (!form) return;

  const CREDIT_BASE_KEY = 'hcp-lead-credits';
  const INITIAL_CREDITS = 1000;
  const elements = {
    niche: document.getElementById('leadNiche'), state: document.getElementById('leadState'),
    city: document.getElementById('leadCity'), quantity: document.getElementById('leadQuantity'),
    size: document.getElementById('leadCompanySize'), status: document.getElementById('leadStatus'),
    type: document.getElementById('leadCompanyType'), website: document.getElementById('leadWebsite'),
    available: document.getElementById('availableCredits'), cost: document.getElementById('estimatedCost'),
    after: document.getElementById('creditsAfterGeneration'), formMessage: document.getElementById('leadFormMessage'),
    resultsMessage: document.getElementById('leadResultsMessage'), resultsSummary: document.getElementById('leadResultsSummary'),
    resultsBody: document.getElementById('leadResultsBody'), selectAll: document.getElementById('selectAllLeads'),
    save: document.getElementById('saveLeadList'), csv: document.getElementById('exportLeadCsv'),
    xlsx: document.getElementById('exportLeadXlsx'), listName: document.getElementById('leadListName'),
    savedLists: document.getElementById('savedLeadLists'), clear: document.getElementById('clearLeadForm'),
    generate: document.getElementById('generateLeadsButton'), sidebarUsage: document.getElementById('sidebarCreditUsage'),
    sidebarProgress: document.getElementById('sidebarCreditProgress')
  };
  const currentLeadLanguage = () => normalizeLeadLanguage(document.documentElement.lang);
  const requestedNiche = readLeadNicheFromSearch(window.location.search);
  if (requestedNiche) elements.niche.value = requestedNiche;
  let readyProfile = null;
  try {
    readyProfile = await Promise.resolve(window.hcpProfileReady);
  } catch {
    readyProfile = null;
  }
  const currentUserId = resolveLeadListUserId(window, readyProfile);
  const SAVED_LISTS_KEY = migrateLegacyFavoriteLeadLists(localStorage, currentUserId);
  const CREDIT_KEY = `${CREDIT_BASE_KEY}:${currentUserId || 'unavailable'}`;
  const supabaseClient = window.hcpSupabase;
  const usesRemoteCredits = Boolean(supabaseClient && currentUserId);

  const readStorageJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };
  const readCredits = () => {
    try {
      return resolveInitialLeadCredits(localStorage.getItem(CREDIT_KEY), INITIAL_CREDITS);
    } catch {
      return INITIAL_CREDITS;
    }
  };
  const state = {
    balance: usesRemoteCredits ? 0 : readCredits(),
    creditReady: !usesRemoteCredits,
    generationPending: false,
    results: [], selected: new Set(), criteria: null,
    pendingDebit: null
  };
  const formatNumber = (value) => Number(value).toLocaleString(currentLeadLanguage());
  const renderStatus = (element, message = '', type = '') => {
    element.textContent = message;
    element.className = `lead-status${type ? ` is-${type}` : ''}`;
    element.hidden = !message;
  };
  const setStatus = (element, message = '', type = '') => {
    element.__hcpLeadMessage = null;
    renderStatus(element, message, type);
  };
  const setLocalizedStatus = (element, descriptor, type = '') => {
    const descriptors = (Array.isArray(descriptor) ? descriptor : [descriptor]).filter(Boolean);
    element.__hcpLeadMessage = { descriptors, type };
    renderStatus(
      element,
      descriptors.map(({ key, parameters = {} }) => getLeadMessage(key, currentLeadLanguage(), parameters)).join(' '),
      type
    );
  };
  const refreshLocalizedStatuses = () => {
    [elements.formMessage, elements.resultsMessage].forEach((element) => {
      const stored = element.__hcpLeadMessage;
      if (stored) setLocalizedStatus(element, stored.descriptors, stored.type);
    });
  };
  const localizedError = (key, parameters = {}) => {
    const error = new Error(getLeadMessage(key, currentLeadLanguage(), parameters));
    error.leadMessage = { key, parameters };
    return error;
  };
  const formCriteria = () => ({
    niche: elements.niche.value, state: elements.state.value, city: elements.city.value,
    quantity: Number(elements.quantity.value),
    filters: { size: elements.size.value, status: elements.status.value, type: elements.type.value, website: elements.website.value }
  });

  function updateCreditSummary() {
    const cost = Number(elements.quantity.value) || 0;
    const remaining = Math.max(0, state.balance - cost);
    elements.available.textContent = state.creditReady ? formatNumber(state.balance) : '—';
    elements.cost.textContent = formatNumber(cost);
    elements.after.textContent = !state.creditReady
      ? '—'
      : state.balance >= cost
      ? formatNumber(remaining)
      : getLeadMessage('balanceInsufficient', currentLeadLanguage());
    elements.after.style.color = !state.creditReady || state.balance >= cost ? '' : 'var(--pink)';
    const usedPercentage = Math.min(100, Math.max(0, ((INITIAL_CREDITS - state.balance) / INITIAL_CREDITS) * 100));
    elements.sidebarUsage.textContent = `${Math.round(usedPercentage)}%`;
    elements.sidebarProgress.style.width = `${usedPercentage}%`;
    elements.generate.disabled = shouldDisableLeadGeneration(state);
  }

  async function loadRemoteCreditBalance() {
    if (!usesRemoteCredits) return;
    state.creditReady = false;
    updateCreditSummary();
    setLocalizedStatus(elements.formMessage, { key: 'creditLoading' });
    const { data, error } = await supabaseClient.rpc('hcp_get_token_balance');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const balance = Number(row?.token_balance);
    if (!Number.isFinite(balance) || balance < 0) throw new Error('invalid_token_balance');
    state.balance = balance;
    state.creditReady = true;
    setStatus(elements.formMessage);
    updateCreditSummary();
  }

  async function debitGeneratedList(quantity, criteria) {
    if (!usesRemoteCredits) {
      const creditResult = consumeLeadCredits(state.balance, quantity, currentLeadLanguage());
      if (!creditResult.ok) throw localizedError('creditConsumeInsufficient');
      state.balance = creditResult.remaining;
      try { localStorage.setItem(CREDIT_KEY, String(state.balance)); } catch { /* saldo permanece válido nesta sessão */ }
      return;
    }

    const fingerprint = JSON.stringify(criteria);
    if (!state.pendingDebit || state.pendingDebit.fingerprint !== fingerprint) {
      state.pendingDebit = { fingerprint, requestId: createLeadRequestId(window) };
    }
    const { data, error } = await supabaseClient.rpc('hcp_consume_lead_credits', {
      p_request_id: state.pendingDebit.requestId,
      p_quantity: quantity
    });
    if (error) {
      const mappedError = localizedError(leadCreditErrorMessage(error));
      if (mappedError.leadMessage.key !== 'creditLoadFailure') state.pendingDebit = null;
      throw mappedError;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const balance = Number(row?.token_balance);
    if (!Number.isFinite(balance) || balance < 0) throw localizedError('creditLoadFailure');
    state.balance = balance;
    state.pendingDebit = null;
  }

  function selectedLeads() {
    return state.results.filter((lead) => state.selected.has(lead.id));
  }

  function updateSelectionUi() {
    const selectedCount = state.selected.size;
    const hasResults = state.results.length > 0;
    const hasSelection = selectedCount > 0;
    elements.selectAll.disabled = !hasResults;
    elements.selectAll.checked = hasResults && selectedCount === state.results.length;
    elements.selectAll.indeterminate = selectedCount > 0 && selectedCount < state.results.length;
    elements.save.disabled = !hasSelection;
    elements.csv.disabled = !hasSelection;
    elements.xlsx.disabled = !hasSelection;
    elements.resultsSummary.textContent = hasResults
      ? getLeadMessage('resultsSummary', currentLeadLanguage(), {
        total: formatNumber(state.results.length), selected: formatNumber(selectedCount)
      })
      : getLeadMessage('resultsInitial', currentLeadLanguage());
  }

  function appendTextCell(row, value) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function renderResults() {
    elements.resultsBody.replaceChildren();
    if (!state.results.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const empty = document.createElement('div');
      cell.colSpan = 12;
      empty.className = 'lead-empty';
      empty.textContent = getLeadMessage('resultsEmpty', currentLeadLanguage());
      cell.appendChild(empty);
      row.appendChild(cell);
      elements.resultsBody.appendChild(row);
      updateSelectionUi();
      return;
    }

    const fragment = document.createDocumentFragment();
    state.results.forEach((lead) => {
      const row = document.createElement('tr');
      const selectionCell = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = state.selected.has(lead.id);
      checkbox.setAttribute('aria-label', `Selecionar ${lead.name}`);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) state.selected.add(lead.id);
        else state.selected.delete(lead.id);
        updateSelectionUi();
      });
      selectionCell.appendChild(checkbox);
      row.appendChild(selectionCell);
      appendTextCell(row, lead.name);
      appendTextCell(row, formatLeadCnpj(lead.cnpj));
      appendTextCell(row, lead.niche);
      appendTextCell(row, `${lead.city}, ${lead.state}`);
      appendTextCell(row, leadToExportRow(lead).Telefone);
      appendTextCell(row, lead.email);
      const siteCell = document.createElement('td');
      if (leadHasWebsite(lead)) {
        const link = document.createElement('a');
        link.href = lead.site;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir site';
        siteCell.appendChild(link);
      } else siteCell.textContent = 'Sem site';
      row.appendChild(siteCell);
      appendTextCell(row, lead.size);
      appendTextCell(row, lead.status);
      appendTextCell(row, lead.type);
      appendTextCell(row, `★ ${lead.rating.toFixed(1)} (${lead.reviews})`);
      fragment.appendChild(row);
    });
    elements.resultsBody.appendChild(fragment);
    updateSelectionUi();
  }

  function safeFilename(value, extension) {
    const base = leadSlug(value || `lista-hcp-${new Date().toISOString().slice(0, 10)}`);
    return `${base}.${extension}`;
  }

  function downloadBlob(content, filename, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function readSavedLists() {
    const lists = readStorageJson(SAVED_LISTS_KEY, []);
    return Array.isArray(lists) ? lists : [];
  }

  function writeSavedLists(lists) {
    try {
      localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(lists));
      return true;
    } catch {
      return false;
    }
  }

  function renderSavedLists() {
    const lists = readSavedLists();
    elements.savedLists.replaceChildren();
    if (!lists.length) {
      const empty = document.createElement('div');
      empty.className = 'lead-empty';
      empty.textContent = 'Nenhuma lista salva.';
      elements.savedLists.appendChild(empty);
      return;
    }
    lists.forEach((list) => {
      const row = document.createElement('div');
      const info = document.createElement('div');
      const name = document.createElement('strong');
      const meta = document.createElement('span');
      const actions = document.createElement('div');
      const load = document.createElement('button');
      const remove = document.createElement('button');
      row.className = 'lead-saved-row';
      actions.className = 'lead-saved-actions';
      name.textContent = list.name;
      meta.textContent = `${formatNumber(list.leads?.length || 0)} leads · ${new Date(list.createdAt).toLocaleString('pt-BR')}`;
      load.type = remove.type = 'button';
      load.className = remove.className = 'lead-action-btn';
      load.textContent = 'Carregar';
      remove.textContent = 'Excluir';
      load.addEventListener('click', () => {
        state.results = dedupeLeads((list.leads || []).filter(isCompleteLead));
        state.selected = new Set(state.results.map((lead) => lead.id));
        state.criteria = null;
        renderResults();
        setLocalizedStatus(elements.resultsMessage, { key: 'listLoaded', parameters: { name: list.name } }, 'success');
        document.getElementById('leadResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      remove.addEventListener('click', () => {
        const approved = typeof window.confirm !== 'function' || window.confirm(`Excluir a lista “${list.name}” deste dispositivo?`);
        if (!approved) return;
        writeSavedLists(readSavedLists().filter((saved) => saved.id !== list.id));
        renderSavedLists();
      });
      info.append(name, meta);
      actions.append(load, remove);
      row.append(info, actions);
      elements.savedLists.appendChild(row);
    });
  }

  form.addEventListener('input', updateCreditSummary);
  form.addEventListener('change', updateCreditSummary);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.generationPending) return;
    setStatus(elements.formMessage);
    setStatus(elements.resultsMessage);
    if (!state.creditReady) {
      setLocalizedStatus(elements.formMessage, { key: 'creditLoading' });
      return;
    }
    const validation = validateLeadGeneration(formCriteria(), state.balance, currentLeadLanguage());
    if (!validation.valid) {
      setLocalizedStatus(elements.formMessage, validation.errorDetails, 'error');
      return;
    }

    state.generationPending = true;
    elements.generate.disabled = true;
    elements.generate.textContent = getLeadMessage('generating', currentLeadLanguage());
    try {
      const results = generateLeads(validation.criteria);
      if (results.length !== validation.criteria.quantity) {
        throw localizedError('generationIncomplete', { quantity: validation.criteria.quantity });
      }
      await debitGeneratedList(results.length, validation.criteria);

      state.results = results;
      state.selected = new Set();
      state.criteria = validation.criteria;
      renderResults();
      updateCreditSummary();
      setLocalizedStatus(elements.resultsMessage, {
        key: 'generationSuccess', parameters: { count: formatNumber(results.length) }
      }, 'success');
      document.getElementById('leadResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setLocalizedStatus(
        elements.formMessage,
        error.leadMessage || { key: 'generationFallback' },
        'error'
      );
    } finally {
      state.generationPending = false;
      elements.generate.disabled = shouldDisableLeadGeneration(state);
      elements.generate.textContent = getLeadMessage('generate', currentLeadLanguage());
    }
  });

  elements.clear.addEventListener('click', () => {
    form.reset();
    setStatus(elements.formMessage);
    updateCreditSummary();
    elements.niche.focus();
  });

  elements.selectAll.addEventListener('change', () => {
    state.selected = elements.selectAll.checked ? new Set(state.results.map((lead) => lead.id)) : new Set();
    renderResults();
  });

  elements.save.addEventListener('click', () => {
    const name = elements.listName.value.trim();
    const leads = selectedLeads();
    if (name.length < 2) {
      setLocalizedStatus(elements.resultsMessage, { key: 'saveNameRequired' }, 'error');
      elements.listName.focus();
      return;
    }
    if (!leads.length) {
      setLocalizedStatus(elements.resultsMessage, { key: 'saveSelectionRequired' }, 'error');
      return;
    }
    const lists = readSavedLists();
    lists.unshift({ id: `lead-list-${Date.now()}`, name, createdAt: new Date().toISOString(), leads });
    if (!writeSavedLists(lists.slice(0, 20))) {
      setLocalizedStatus(elements.resultsMessage, { key: 'saveStorageError' }, 'error');
      return;
    }
    elements.listName.value = '';
    renderSavedLists();
    setLocalizedStatus(elements.resultsMessage, {
      key: 'saveSuccess', parameters: { name, count: formatNumber(leads.length) }
    }, 'success');
  });

  elements.csv.addEventListener('click', async () => {
    const leads = selectedLeads();
    if (!leads.length) {
      setLocalizedStatus(elements.resultsMessage, { key: 'exportSelectionRequired' }, 'error');
      return;
    }
    elements.csv.disabled = true;
    try {
      const language = currentLeadLanguage();
      const filename = safeFilename(elements.listName.value, 'csv');
      const content = leadsToCsv(leads);
      const nativeExport = await shareNativeLeadExport(window, {
        filename,
        data: content,
        encoding: 'utf8',
        title: getLeadMessage('exportShareTitle', language),
        dialogTitle: getLeadMessage('exportShareDialog', language)
      });
      if (!nativeExport.handled) downloadBlob(content, filename, 'text/csv;charset=utf-8');
      setLocalizedStatus(elements.resultsMessage, {
        key: 'csvSuccess', parameters: { count: formatNumber(leads.length) }
      }, 'success');
    } catch {
      setLocalizedStatus(elements.resultsMessage, { key: 'csvFailure' }, 'error');
    } finally {
      elements.csv.disabled = state.selected.size === 0;
    }
  });

  elements.xlsx.addEventListener('click', async () => {
    const leads = selectedLeads();
    if (!leads.length) {
      setLocalizedStatus(elements.resultsMessage, { key: 'exportSelectionRequired' }, 'error');
      return;
    }
    if (!window.XLSX?.utils || (
      typeof window.XLSX.writeFile !== 'function' && typeof window.XLSX.write !== 'function'
    )) {
      setLocalizedStatus(elements.resultsMessage, { key: 'xlsxUnavailable' }, 'error');
      return;
    }
    elements.xlsx.disabled = true;
    try {
      const worksheet = window.XLSX.utils.json_to_sheet(leadsToXlsxData(leads));
      worksheet['!cols'] = HCP_EXPORT_COLUMNS.map(([label]) => ({ wch: Math.max(12, label.length + 3) }));
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
      const filename = safeFilename(elements.listName.value, 'xlsx');
      let nativeExport = { handled: false };
      if (nativeLeadExportPlugins(window) && typeof window.XLSX.write === 'function') {
        const language = currentLeadLanguage();
        nativeExport = await shareNativeLeadExport(window, {
          filename,
          data: window.XLSX.write(workbook, { bookType: 'xlsx', type: 'base64', compression: true }),
          title: getLeadMessage('exportShareTitle', language),
          dialogTitle: getLeadMessage('exportShareDialog', language)
        });
      }
      if (!nativeExport.handled) {
        if (typeof window.XLSX.writeFile !== 'function') throw new Error('xlsx_web_export_unavailable');
        window.XLSX.writeFile(workbook, filename);
      }
      setLocalizedStatus(elements.resultsMessage, {
        key: 'xlsxSuccess', parameters: { count: formatNumber(leads.length) }
      }, 'success');
    } catch {
      setLocalizedStatus(elements.resultsMessage, { key: 'xlsxFailure' }, 'error');
    } finally {
      elements.xlsx.disabled = state.selected.size === 0;
    }
  });

  document.addEventListener('hcp:languagechange', () => {
    updateCreditSummary();
    updateSelectionUi();
    refreshLocalizedStatuses();
    if (!elements.generate.disabled) elements.generate.textContent = getLeadMessage('generate', currentLeadLanguage());
  });

  updateCreditSummary();
  renderResults();
  renderSavedLists();
  if (usesRemoteCredits) {
    try {
      await loadRemoteCreditBalance();
    } catch (error) {
      state.creditReady = false;
      updateCreditSummary();
      setLocalizedStatus(elements.formMessage, { key: leadCreditErrorMessage(error) }, 'error');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeLeadText,
    getLeadMessage,
    resolveInitialLeadCredits,
    readLeadNicheFromSearch,
    favoriteLeadListsStorageKey,
    resolveLeadListUserId,
    migrateLegacyFavoriteLeadLists,
    validateLeadGeneration,
    filterLeads,
    generateLeads,
    isCompleteLead,
    dedupeLeads,
    consumeLeadCredits,
    createLeadRequestId,
    leadCreditErrorMessage,
    shouldDisableLeadGeneration,
    leadsToCsv,
    leadsToXlsxData,
    isNativeLeadExportRuntime,
    buildNativeLeadExportPath,
    shareNativeLeadExport,
    formatLeadCnpj
  };
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeLeadGenerator);
  else initializeLeadGenerator();
}
