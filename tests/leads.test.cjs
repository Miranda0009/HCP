const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
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
} = require('../js/leads.js');

const page = fs.readFileSync(path.resolve(__dirname, '../html/gerar-leads.html'), 'utf8');
const script = fs.readFileSync(path.resolve(__dirname, '../js/leads.js'), 'utf8');

const BASE_CRITERIA = Object.freeze({
  niche: 'Clínicas odontológicas',
  state: 'SP',
  city: 'Campinas',
  quantity: 50,
  filters: { size: 'small', status: 'active', type: 'ltda', website: 'with' }
});

function completeLead(overrides = {}) {
  return {
    id: 'lead-1',
    name: 'Clínica Alfa, Saúde',
    cnpj: '37335118000180',
    niche: 'Clínicas odontológicas',
    city: 'Campinas',
    state: 'SP',
    phone: '11999999999',
    email: 'contato@clinica.example',
    site: 'https://clinica.example',
    sizeCode: 'small',
    size: 'Pequena',
    statusCode: 'active',
    status: 'Ativa',
    typeCode: 'ltda',
    type: 'Sociedade Limitada',
    rating: 4.6,
    reviews: 127,
    source: 'HCP — testes',
    ...overrides
  };
}

test('nova rota contém fluxo completo e SheetJS oficial fixado', () => {
  assert.match(page, /<h1>Gerar Lista de Leads<\/h1>/);
  assert.match(page, /id="leadNiche"[^>]+list="leadNicheSuggestions"/);
  assert.equal((page.match(/<option value="(?:50|100|150|200|250|300)">/g) || []).length, 6);
  assert.match(page, /<option value="AC">Acre<\/option>/);
  assert.match(page, /<option value="TO">Tocantins<\/option>/);
  assert.match(page, /https:\/\/cdn\.sheetjs\.com\/xlsx-0\.20\.3\/package\/dist\/xlsx\.full\.min\.js/);
  assert.match(script, /hcp-favorite-lead-lists/);
});

test('link com ?nicho= decodifica e preenche o nicho solicitado', () => {
  assert.equal(
    readLeadNicheFromSearch('?nicho=Consultorias%20Comerciais%20%2F%20SDR%20%2F%20BDR'),
    'Consultorias Comerciais / SDR / BDR'
  );
  assert.equal(readLeadNicheFromSearch('?outra=informacao'), '');
  assert.match(script, /readLeadNicheFromSearch\(window\.location\.search\)/);
});

test('normalização de pesquisa ignora acentos, caixa e espaços repetidos', () => {
  assert.equal(normalizeLeadText('  CLÍNICAS   Odontológicas '), 'clinicas odontologicas');
});

test('saldo inicial é 1.000 quando a chave ainda não existe, sem sobrescrever saldo zero', () => {
  assert.equal(resolveInitialLeadCredits(null), 1000);
  assert.equal(resolveInitialLeadCredits(undefined), 1000);
  assert.equal(resolveInitialLeadCredits(''), 1000);
  assert.equal(resolveInitialLeadCredits('inválido'), 1000);
  assert.equal(resolveInitialLeadCredits('0'), 0);
  assert.equal(resolveInitialLeadCredits('725'), 725);
});

test('listas locais usam chave por usuário e migram a chave legada uma única vez', () => {
  const values = new Map([
    ['hcp-favorite-lead-lists', JSON.stringify([
      { id: 'legacy-1', name: 'Lista antiga', createdAt: '2026-08-15T10:00:00Z', leads: [] }
    ])],
    ['hcp-favorite-lead-lists:user-123', JSON.stringify([
      { id: 'scoped-1', name: 'Lista da conta', createdAt: '2026-08-15T11:00:00Z', leads: [] }
    ])]
  ]);
  const storage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };

  assert.equal(resolveLeadListUserId({ hcpCurrentUser: { id: 'user-123' } }), 'user-123');
  assert.equal(favoriteLeadListsStorageKey('user-123'), 'hcp-favorite-lead-lists:user-123');
  const scopedKey = migrateLegacyFavoriteLeadLists(storage, 'user-123');
  assert.equal(scopedKey, 'hcp-favorite-lead-lists:user-123');
  assert.equal(storage.getItem('hcp-favorite-lead-lists'), null);
  assert.deepEqual(JSON.parse(storage.getItem(scopedKey)).map((list) => list.id), ['scoped-1', 'legacy-1']);

  migrateLegacyFavoriteLeadLists(storage, 'user-123');
  assert.deepEqual(JSON.parse(storage.getItem(scopedKey)).map((list) => list.id), ['scoped-1', 'legacy-1']);
  const secondUserKey = migrateLegacyFavoriteLeadLists(storage, 'user-456');
  assert.equal(secondUserKey, 'hcp-favorite-lead-lists:user-456');
  assert.equal(storage.getItem(secondUserKey), null);
  assert.match(script, /await Promise\.resolve\(window\.hcpProfileReady\)/);
});

test('validação aceita nicho digitado e quantidades redondas previstas', () => {
  for (const quantity of [50, 100, 150, 200, 250, 300]) {
    const validation = validateLeadGeneration({ ...BASE_CRITERIA, quantity }, 1000);
    assert.equal(validation.valid, true, validation.errors.join(' '));
  }
});

test('validação informa nicho, UF, quantidade e créditos inválidos com clareza', () => {
  const validation = validateLeadGeneration({ niche: '', state: 'XX', city: 'A', quantity: 70 }, 20);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(' '), /nicho ou segmento/i);
  assert.match(validation.errors.join(' '), /cidade válida/i);
  assert.match(validation.errors.join(' '), /estado válido/i);
  assert.match(validation.errors.join(' '), /intervalos de 50/i);
  assert.match(validation.errors.join(' '), /Créditos insuficientes/i);
});

test('filtros combinam nicho, cidade, estado, porte, situação, tipo e site', () => {
  const matching = completeLead();
  const withoutSite = completeLead({ id: 'lead-2', cnpj: '11222333000181', site: 'Sem site', phone: '11988888888' });
  const otherState = completeLead({ id: 'lead-3', cnpj: '99888777000166', state: 'RJ', city: 'Niterói', phone: '21977777777' });
  const filtered = filterLeads([matching, withoutSite, otherState], BASE_CRITERIA);
  assert.deepEqual(filtered.map((lead) => lead.id), ['lead-1']);
});

test('geração é determinística, completa, deduplicada e respeita a quantidade', () => {
  const first = generateLeads(BASE_CRITERIA);
  const second = generateLeads(BASE_CRITERIA);
  assert.equal(first.length, 50);
  assert.deepEqual(first, second);
  assert.equal(first.every(isCompleteLead), true);
  assert.equal(new Set(first.map((lead) => lead.cnpj)).size, 50);
  assert.equal(first.every((lead) => lead.city === 'Campinas' && lead.state === 'SP'), true);
  assert.equal(first.every((lead) => lead.sizeCode === 'small' && lead.typeCode === 'ltda'), true);
  assert.equal(first.every((lead) => lead.statusCode === 'active' && lead.site !== 'Sem site'), true);
});

test('geração suporta 300 leads e infere a UF de uma cidade conhecida', () => {
  const leads = generateLeads({
    niche: 'Agências de Marketing', state: 'ALL', city: 'Campinas', quantity: 300,
    filters: { size: 'any', status: 'active', type: 'any', website: 'any' }
  });
  assert.equal(leads.length, 300);
  assert.equal(leads.every((lead) => lead.state === 'SP' && lead.city === 'Campinas'), true);
});

test('Ribeirão Preto é reconhecida como SP e cidade desconhecida exige UF', () => {
  const known = generateLeads({
    niche: 'Tecnologia', state: 'ALL', city: 'Ribeirão Preto', quantity: 50,
    filters: { size: 'any', status: 'active', type: 'any', website: 'any' }
  });
  assert.equal(known.length, 50);
  assert.equal(known.every((lead) => lead.city === 'Ribeirão Preto' && lead.state === 'SP'), true);

  const unknown = validateLeadGeneration({
    niche: 'Tecnologia', state: 'ALL', city: 'Cidade Experimental', quantity: 50,
    filters: { size: 'any', status: 'active', type: 'any', website: 'any' }
  }, 1000);
  assert.equal(unknown.valid, false);
  assert.match(unknown.errors.join(' '), /identificar a UF/i);
  assert.deepEqual(generateLeads(unknown.criteria), []);

  const explicitState = validateLeadGeneration({ ...unknown.criteria, state: 'PR' }, 1000);
  assert.equal(explicitState.valid, true, explicitState.errors.join(' '));
});

test('cidade conhecida incompatível com a UF selecionada gera mensagem clara', () => {
  const validation = validateLeadGeneration({
    ...BASE_CRITERIA,
    city: 'Ribeirão Preto',
    state: 'RJ'
  }, 1000);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(' '), /pertence a SP/i);
  assert.match(validation.errors.join(' '), /selecionado é RJ/i);
});

test('validação e mensagens dinâmicas oferecem português e inglês e reagem ao evento global', () => {
  const validation = validateLeadGeneration({
    niche: '', state: 'ALL', city: 'Unknown City', quantity: 50
  }, 10, 'en-US');
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(' '), /Enter a niche or segment/i);
  assert.match(validation.errors.join(' '), /could not identify the state/i);
  assert.match(validation.errors.join(' '), /Insufficient credits/i);
  assert.match(consumeLeadCredits(10, 50, 'en-US').error, /Insufficient credits/i);
  assert.equal(getLeadMessage('xlsxFailure', 'en-US'), 'We could not create the Excel file. Try exporting it again.');
  assert.match(script, /addEventListener\('hcp:languagechange'/);
});

test('deduplicação identifica CNPJ, telefone, domínio e empresa/localização repetidos', () => {
  const original = completeLead();
  const sameCnpj = completeLead({ id: 'dup-cnpj', name: 'Outro nome' });
  const samePhone = completeLead({ id: 'dup-phone', cnpj: '11222333000181', name: 'Outra empresa', site: 'https://outra.example' });
  const sameSite = completeLead({ id: 'dup-site', cnpj: '99888777000166', phone: '11977777777', name: 'Terceira empresa' });
  const sameIdentity = completeLead({ id: 'dup-name', cnpj: '44555666000144', phone: '11966666666', site: 'Sem site' });
  const unique = completeLead({ id: 'unique', cnpj: '55666777000155', phone: '21955555555', site: 'https://unica.example', name: 'Empresa Única', city: 'Niterói', state: 'RJ' });
  assert.deepEqual(dedupeLeads([original, sameCnpj, samePhone, sameSite, sameIdentity, unique]).map((lead) => lead.id), ['lead-1', 'unique']);
});

test('consumo de créditos é atômico na função pura e nunca deixa saldo negativo', () => {
  assert.deepEqual(consumeLeadCredits(1000, 300), { ok: true, consumed: 300, remaining: 700, error: null });
  const insufficient = consumeLeadCredits(40, 50);
  assert.equal(insufficient.ok, false);
  assert.equal(insufficient.consumed, 0);
  assert.equal(insufficient.remaining, 40);
  assert.match(insufficient.error, /insuficientes/i);
});

test('consumo autenticado usa RPC idempotente e saldo do servidor', () => {
  const requestId = createLeadRequestId({
    crypto: { randomUUID: () => '26b56b4d-391f-45a6-8b91-d34d7cd4d112' }
  });
  assert.equal(requestId, '26b56b4d-391f-45a6-8b91-d34d7cd4d112');
  assert.match(script, /rpc\('hcp_get_token_balance'\)/);
  assert.match(script, /rpc\('hcp_consume_lead_credits'/);
  assert.match(script, /p_request_id:\s*state\.pendingDebit\.requestId/);
  assert.match(script, /p_quantity:\s*quantity/);
  assert.equal(leadCreditErrorMessage({ message: 'insufficient_lead_credits' }), 'creditConsumeInsufficient');
  assert.equal(leadCreditErrorMessage({ message: 'account_membership_required' }), 'creditMembershipRequired');
  assert.equal(leadCreditErrorMessage({ message: 'lead_credit_request_conflict' }), 'creditRequestConflict');
  assert.equal(shouldDisableLeadGeneration({ creditReady: true, generationPending: false }), false);
  assert.equal(shouldDisableLeadGeneration({ creditReady: true, generationPending: true }), true);
  assert.equal(shouldDisableLeadGeneration({ creditReady: false, generationPending: false }), true);
  assert.match(script, /if \(state\.generationPending\) return/);
});

test('CSV usa BOM, preserva CNPJ e escapa vírgulas, aspas, quebras e fórmulas', () => {
  const csv = leadsToCsv([completeLead({ name: 'Clínica "Alfa", Saúde\nUnidade', email: '=HYPERLINK("https://malicioso")' })]);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  assert.match(csv, /^\uFEFFEmpresa,CNPJ,Nicho,/);
  assert.match(csv, /37\.335\.118\/0001-80/);
  assert.match(csv, /"Clínica ""Alfa"", Saúde\nUnidade"/);
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/malicioso""\)"/);
});

test('dados XLSX têm cabeçalhos estáveis, números tipados e neutralizam fórmulas', () => {
  const [row] = leadsToXlsxData([completeLead({ name: '+SOMA(A1:A2)' })]);
  assert.deepEqual(Object.keys(row), [
    'Empresa', 'CNPJ', 'Nicho', 'Cidade', 'UF', 'Telefone', 'E-mail', 'Site', 'Porte', 'Situação',
    'Tipo', 'Avaliação', 'Quantidade de avaliações', 'Fonte'
  ]);
  assert.equal(row.Empresa, "'+SOMA(A1:A2)");
  assert.equal(row.CNPJ, '37.335.118/0001-80');
  assert.equal(row.Avaliação, 4.6);
  assert.equal(row['Quantidade de avaliações'], 127);
  assert.equal(formatLeadCnpj('37335118000180'), '37.335.118/0001-80');
});

test('exportação nativa só é ativada no Capacitor e cria um caminho seguro no cache', () => {
  assert.equal(isNativeLeadExportRuntime({}), false);
  assert.equal(isNativeLeadExportRuntime({ Capacitor: { isNativePlatform: () => false } }), false);
  assert.equal(isNativeLeadExportRuntime({ Capacitor: { isNativePlatform: () => true } }), true);
  assert.equal(isNativeLeadExportRuntime({ Capacitor: { getPlatform: () => 'android' } }), true);
  assert.equal(isNativeLeadExportRuntime({ Capacitor: { getPlatform: () => 'web' } }), false);
  assert.equal(
    buildNativeLeadExportPath('../lista:inválida?.csv', 1234),
    'hcp-exports/1234-lista-inválida-.csv'
  );
});

test('CSV nativo é gravado em UTF-8 no cache e compartilhado pelo URI do arquivo', async () => {
  const calls = {};
  const runtime = {
    Capacitor: {
      isNativePlatform: () => true,
      Plugins: {
        Filesystem: {
          writeFile: async (options) => {
            calls.write = options;
            return { uri: 'file:///cache/hcp-exports/lista.csv' };
          }
        },
        Share: {
          canShare: async () => ({ value: true }),
          share: async (options) => { calls.share = options; }
        }
      }
    }
  };

  const result = await shareNativeLeadExport(runtime, {
    filename: 'lista.csv',
    data: '\uFEFFEmpresa,CNPJ',
    encoding: 'utf8',
    title: 'Lista de leads HCP',
    dialogTitle: 'Salvar ou compartilhar lista',
    now: 99
  });

  assert.deepEqual(calls.write, {
    path: 'hcp-exports/99-lista.csv',
    data: '\uFEFFEmpresa,CNPJ',
    directory: 'CACHE',
    recursive: true,
    encoding: 'utf8'
  });
  assert.deepEqual(calls.share, {
    title: 'Lista de leads HCP',
    files: ['file:///cache/hcp-exports/lista.csv'],
    dialogTitle: 'Salvar ou compartilhar lista'
  });
  assert.equal(result.handled, true);
});

test('XLSX nativo preserva base64 binário e usa getUri quando writeFile não retorna URI', async () => {
  const calls = {};
  const runtime = {
    Capacitor: {
      isNativePlatform: () => true,
      Plugins: {
        Filesystem: {
          writeFile: async (options) => { calls.write = options; return {}; },
          getUri: async (options) => { calls.getUri = options; return { uri: 'file:///cache/lista.xlsx' }; }
        },
        Share: {
          share: async (options) => { calls.share = options; }
        }
      }
    }
  };

  const result = await shareNativeLeadExport(runtime, {
    filename: 'lista.xlsx',
    data: 'UEsDBAoAAAAA',
    now: 100
  });

  assert.equal(calls.write.data, 'UEsDBAoAAAAA');
  assert.equal(calls.write.directory, 'CACHE');
  assert.equal('encoding' in calls.write, false);
  assert.deepEqual(calls.getUri, { path: 'hcp-exports/100-lista.xlsx', directory: 'CACHE' });
  assert.deepEqual(calls.share.files, ['file:///cache/lista.xlsx']);
  assert.equal(result.handled, true);
});

test('site mantém download web quando os plugins nativos não estão disponíveis', async () => {
  assert.deepEqual(
    await shareNativeLeadExport({ Capacitor: { isNativePlatform: () => false } }, { filename: 'lista.csv' }),
    { handled: false }
  );
  assert.match(script, /if \(!nativeExport\.handled\) downloadBlob\(content, filename,/);
  assert.match(script, /if \(!nativeExport\.handled\)[\s\S]*window\.XLSX\.writeFile\(workbook, filename\)/);
});
