(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HCPPilot = api;
})(typeof window === 'undefined' ? globalThis : window, function (root) {
  'use strict';
  const names = { starter: 'Arranque', pro: 'Pro', business: 'Negócios', custom: 'Sob medida' };
  const aliases = { Arranque: 'starter', Starter: 'starter', Pro: 'pro', Negócios: 'business', Business: 'business' };
  function makePilotPlan(plan, cycle = 'monthly') {
    const id = aliases[plan] || plan;
    if (!Object.hasOwn(names, id) || !['monthly', 'yearly'].includes(cycle)) throw new Error('Plano inválido.');
    return { version: 1, id, cycle, status: 'pilot_active', charged: false, activatedAt: new Date().toISOString() };
  }
  async function savePilotPlan(client, plan, cycle) {
    const selection = makePilotPlan(plan, cycle);
    // Preferência de piloto, nunca usada para autorizar acesso ou provar pagamento.
    const { error } = await client.auth.updateUser({ data: { hcp_pilot_plan: selection } });
    if (error) throw error;
    return selection;
  }
  function historyKey(userId) {
    if (!userId) throw new Error('Usuário necessário.');
    return `hcp-search-history:${userId}`;
  }
  function validEntry(entry) {
    const c = entry?.criteria;
    return typeof entry?.id === 'string' && Number.isFinite(Date.parse(entry.createdAt))
      && typeof c?.niche === 'string' && c.niche.length >= 2 && c.niche.length <= 120
      && typeof c.city === 'string' && c.city.length <= 80 && typeof c.state === 'string'
      && [50, 100, 150, 200, 250, 300].includes(c.quantity) && c.filters && typeof c.filters === 'object';
  }
  function readHistory(store, userId) {
    try {
      const entries = JSON.parse(store.getItem(historyKey(userId)) || '[]');
      return Array.isArray(entries) ? entries.filter(validEntry).slice(0, 20) : [];
    } catch { return []; }
  }
  function recordSearch(store, userId, criteria, count) {
    const key = historyKey(userId);
    const entry = { id: root.crypto.randomUUID(), createdAt: new Date().toISOString(),
      criteria: JSON.parse(JSON.stringify(criteria)), count: Number(count), source: 'synthetic_demo' };
    if (!validEntry(entry)) throw new Error('Critérios inválidos.');
    store.setItem(key, JSON.stringify([entry, ...readHistory(store, userId)].slice(0, 20)));
    return entry;
  }
  function findSearch(store, userId, id) {
    return readHistory(store, userId).find(entry => entry.id === id) || null;
  }
  const api = { makePilotPlan, savePilotPlan, readHistory, recordSearch, findSearch };
  if (!root.document) return api;
  const doc = root.document;
  const english = () => doc.documentElement.lang.startsWith('en');
  const copy = (pt, en) => english() ? en : pt;
  const node = (tag, text, className) => {
    const result = doc.createElement(tag);
    if (text !== undefined) result.textContent = text;
    if (className) result.className = className;
    return result;
  };
  async function initialize() {
    try { await root.hcpProfileReady; } catch { return; }
    const user = root.hcpCurrentUser;
    if (!user?.id) return;
    let activePlan = null;
    const preview = ['127.0.0.1', 'localhost'].includes(root.location.hostname)
      && new URLSearchParams(root.location.search).has('preview');
    const previewKey = `hcp-pilot-plan:${user.id}`;
    if (preview) {
      try { activePlan = JSON.parse(root.localStorage.getItem(previewKey)); } catch { /* nada salvo */ }
    } else activePlan = user.user_metadata?.hcp_pilot_plan || null;
    let status = doc.getElementById('pilotPlanStatus');
    if (doc.querySelector('.pricing-grid, [data-hcp-plan-builder]')) {
      status = node('section', undefined, 'panel');
      status.id = 'pilotPlanStatus';
      status.setAttribute('role', 'status');
      status.style.marginBottom = '20px';
      const anchor = doc.querySelector('.billing-toggle, .plan-builder-dashboard, .custom-plan-panel');
      if (anchor) anchor.before(status);
      else doc.querySelector('.page-head')?.after(status);
    }
    let busy = false;
    const buttons = [...doc.querySelectorAll('.price-cta')];
    function renderPlan(message) {
      const valid = activePlan?.status === 'pilot_active' && activePlan.charged === false && Object.hasOwn(names, activePlan.id);
      const label = valid ? `${names[activePlan.id]} · ${copy('Piloto ativo', 'Active pilot')}` : copy('Sem plano ativo', 'No active plan');
      doc.querySelectorAll('.plan-name, .plan-price').forEach(el => { el.textContent = label; });
      doc.querySelectorAll('.plan-price + span').forEach(el => {
        el.textContent = copy('Sem cobrança ou renovação automática.', 'No charge or automatic renewal.');
      });
      if (status) {
        status.replaceChildren(node('h2', label), node('p', message || copy(
          'Escolha um plano para o piloto. Nenhum pagamento será realizado. Valores e recursos comerciais ainda são propostas, não uma assinatura contratada.',
          'Choose a pilot plan. No payment will be made. Commercial prices and features are proposals, not a purchased subscription.')));
      }
      buttons.forEach(btn => {
        const id = aliases[btn.dataset.plan] || btn.dataset.plan;
        const selected = valid && id === activePlan.id;
        btn.textContent = selected ? copy('Plano ativo no piloto', 'Active pilot plan') : copy('Ativar no piloto — grátis', 'Activate free pilot');
        btn.disabled = busy || selected;
        btn.setAttribute('aria-pressed', String(selected));
      });
    }
    async function activate(planId) {
      if (busy) return;
      busy = true;
      renderPlan(copy('Salvando plano…', 'Saving plan…'));
      const cycle = doc.querySelector('[data-billing].active')?.dataset.billing || 'monthly';
      try {
        let next;
        if (preview) {
          next = makePilotPlan(planId, cycle);
          root.localStorage.setItem(previewKey, JSON.stringify(next));
        } else next = await savePilotPlan(root.hcpSupabase, planId, cycle);
        activePlan = next;
        user.user_metadata = { ...user.user_metadata, hcp_pilot_plan: next };
        renderPlan(copy('Plano salvo na conta para o piloto. Nenhuma cobrança realizada.', 'Pilot plan saved to your account. No charge made.'));
      } catch {
        renderPlan(copy('Não foi possível salvar. O plano anterior foi mantido. Tente novamente.', 'Could not save. Your previous plan was kept. Try again.'));
      } finally { busy = false; renderPlan(status?.querySelector('p')?.textContent); }
    }
    buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.plan)));
    root.addEventListener('hcp:plan-selected', event => {
      const id = event.detail?.recommendation?.planId;
      if (Object.hasOwn(names, id)) activate(id);
    });
    doc.addEventListener('hcp:languagechange', () => { renderPlan(); renderHistory(); });
    function renderHistory() {
      const tbody = doc.getElementById('searchHistoryRows');
      const recent = doc.getElementById('recentSearches');
      if (!tbody && !recent) return;
      const entries = readHistory(root.localStorage, user.id);
      if (tbody) {
        tbody.replaceChildren();
        entries.forEach(entry => {
          const row = node('tr');
          const c = entry.criteria;
          const title = `${c.niche} — ${[c.city, c.state === 'ALL' ? '' : c.state].filter(Boolean).join(', ') || copy('Brasil', 'Brazil')}`;
          const action = node('a', copy('Reabrir', 'Reopen'), 'chip-btn');
          action.href = `gerar-leads.html?pesquisa=${encodeURIComponent(entry.id)}${preview ? '&preview' : ''}`;
          const cell = node('td'); cell.append(action);
          row.append(node('td', title), node('td', new Date(entry.createdAt).toLocaleString(english() ? 'en-US' : 'pt-BR')),
            node('td', `${entry.count} · demo`), cell);
          tbody.append(row);
        });
        if (!entries.length) {
          const row = node('tr'); const cell = node('td', copy('Nenhuma pesquisa neste dispositivo. Gere uma demonstração para começar.', 'No searches on this device. Generate a demo to begin.'));
          cell.colSpan = 4; row.append(cell); tbody.append(row);
        }
      }
      if (recent) {
        recent.querySelectorAll('.list-row, .history-empty').forEach(el => el.remove());
        entries.slice(0, 4).forEach(entry => {
          const row = node('div', undefined, 'list-row');
          const info = node('div', undefined, 'row-info');
          info.append(node('strong', entry.criteria.niche), node('span', `${entry.count} · demo`));
          const action = node('a', copy('Reabrir', 'Reopen'), 'chip-btn');
          action.href = `gerar-leads.html?pesquisa=${encodeURIComponent(entry.id)}${preview ? '&preview' : ''}`;
          row.append(info, action); recent.append(row);
        });
        if (!entries.length) recent.append(node('p', copy('Nenhuma pesquisa neste dispositivo.', 'No searches on this device.'), 'history-empty'));
      }
    }
    // A lista é montada após a sessão: nunca adota o histórico de outra conta.
    renderHistory();
    renderPlan();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  return api;
});
