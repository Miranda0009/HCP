(function () {
  'use strict';

  const STORAGE_KEY = 'hcp-crm-v1';
  const CRM_TEMPLATES = Object.freeze({
    sales: { label: 'Vendas', description: 'Modelo de vendas para oportunidades comerciais.', stages: ['Lead novo', 'Contato feito', 'Diagnóstico', 'Proposta enviada', 'Negociação', 'Fechado'] },
    success: { label: 'Sucesso do cliente', description: 'Modelo para acompanhar onboarding, saúde e renovação da carteira.', stages: ['Onboarding', 'Adoção', 'Acompanhamento', 'Expansão', 'Renovação'] },
    recruitment: { label: 'Recrutamento', description: 'Modelo para acompanhar candidatos em cada fase de seleção.', stages: ['Triagem', 'Entrevista inicial', 'Entrevista técnica', 'Proposta', 'Contratado'] },
    custom: { label: 'Personalizado', description: 'Monte todas as etapas do zero conforme a operação.', stages: [] }
  });
  const initialState = {
    currentAreaId: 'vendas',
    areas: [{
      id: 'vendas',
      name: 'Vendas B2B',
      template: 'sales',
      stages: [
        { id: 'novas', name: 'Novas oportunidades' },
        { id: 'qualificacao', name: 'Qualificação' },
        { id: 'proposta', name: 'Proposta enviada' },
        { id: 'fechado', name: 'Fechado' }
      ],
      cards: [
        { id: 'atlas', stageId: 'novas', name: 'Atlas Alimentos', contact: 'Marina · Operações', value: 'R$ 8.500' },
        { id: 'nova', stageId: 'qualificacao', name: 'Nova Contábil', contact: 'Pedro · Sócio', value: 'R$ 4.200' },
        { id: 'faro', stageId: 'proposta', name: 'Faro Segurança', contact: 'Camila · Compras', value: 'R$ 16.000' }
      ]
    }]
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const readState = () => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return saved?.areas?.length ? saved : clone(initialState); } catch { return clone(initialState); } };
  let state = readState();

  const el = (id) => document.getElementById(id);
  const columns = el('crmColumns');
  const areaSelect = el('crmAreaSelect');
  const stageList = el('crmStageList');
  const modal = el('crmModal');
  const cardStage = el('crmCardStage');
  const templateSelect = el('crmTemplate');
  const templateDescription = el('crmTemplateDescription');

  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
  function area() { return state.areas.find((item) => item.id === state.currentAreaId) || state.areas[0]; }
  function ensureAreaShape(current) { if (!current.template || !CRM_TEMPLATES[current.template]) current.template = current.id === 'vendas' ? 'sales' : 'custom'; return current; }
  function updateAreaOptions() {
    const current = ensureAreaShape(area());
    state.currentAreaId = current.id;
    areaSelect.replaceChildren(...state.areas.map((item) => new Option(item.name, item.id, item.id === current.id, item.id === current.id)));
    templateSelect.value = current.template;
    templateDescription.textContent = CRM_TEMPLATES[current.template].description;
    el('crmAreaRename').value = current.name;
  }
  function renderStages() {
    const current = area();
    stageList.replaceChildren(...current.stages.map((stage) => {
      const row = document.createElement('div');
      row.className = 'crm-stage-row';
      const count = current.cards.filter((card) => card.stageId === stage.id).length;
      const input = document.createElement('input');
      input.value = stage.name; input.maxLength = 40; input.setAttribute('aria-label', `Nome da etapa ${stage.name}`);
      input.addEventListener('change', () => { const name = input.value.trim(); if (name) { stage.name = name; save(); render(); } else input.value = stage.name; });
      const countLabel = document.createElement('small'); countLabel.textContent = `(${count})`;
      row.append(input, countLabel);
      const remove = document.createElement('button');
      remove.type = 'button'; remove.title = 'Excluir etapa'; remove.setAttribute('aria-label', `Excluir etapa ${stage.name}`); remove.textContent = '×';
      remove.disabled = current.stages.length === 1;
      remove.addEventListener('click', () => {
        if (!confirm(`Excluir a etapa “${stage.name}”? Os cards vão para a primeira etapa.`)) return;
        const fallback = current.stages.find((item) => item.id !== stage.id);
        current.cards.forEach((card) => { if (card.stageId === stage.id) card.stageId = fallback.id; });
        current.stages = current.stages.filter((item) => item.id !== stage.id);
        save(); render();
      });
      row.append(remove); return row;
    }));
  }
  function renderCard(card) {
    const item = document.createElement('article');
    item.className = 'crm-card'; item.draggable = true; item.dataset.cardId = card.id;
    item.innerHTML = `<div class="crm-card-top"><h3>${escapeHtml(card.name)}</h3><button type="button" aria-label="Excluir ${escapeHtml(card.name)}" title="Excluir cliente">×</button></div><p>${escapeHtml(card.contact || 'Sem contato definido')}</p><div class="crm-card-meta"><span>Cliente</span><span class="crm-card-value">${escapeHtml(card.value || 'Sem valor')}</span></div>`;
    item.addEventListener('dragstart', (event) => { item.classList.add('dragging'); event.dataTransfer.setData('text/plain', card.id); event.dataTransfer.effectAllowed = 'move'; });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.querySelector('button').addEventListener('click', () => { if (confirm(`Excluir ${card.name} do CRM?`)) { const current = area(); current.cards = current.cards.filter((entry) => entry.id !== card.id); save(); render(); } });
    return item;
  }
  function renderBoard() {
    const current = area();
    columns.replaceChildren(...current.stages.map((stage) => {
      const column = document.createElement('section'); column.className = 'crm-column';
      const cards = current.cards.filter((card) => card.stageId === stage.id);
      const title = document.createElement('div'); title.className = 'crm-column-head';
      title.innerHTML = `<div class="crm-column-title"><h2>${escapeHtml(stage.name)}</h2><span class="crm-column-count">${cards.length}</span></div>`;
      const actions = document.createElement('div'); actions.className = 'crm-stage-actions';
      const add = document.createElement('button'); add.type = 'button'; add.className = 'crm-icon-btn'; add.title = 'Adicionar cliente nesta etapa'; add.textContent = '+';
      add.addEventListener('click', () => openModal(stage.id)); actions.append(add); title.append(actions);
      const list = document.createElement('div'); list.className = 'crm-card-list'; list.dataset.stageId = stage.id;
      if (cards.length) list.append(...cards.map(renderCard)); else list.innerHTML = '<p class="crm-empty">Arraste clientes para cá.</p>';
      list.addEventListener('dragover', (event) => { event.preventDefault(); list.classList.add('is-over'); event.dataTransfer.dropEffect = 'move'; });
      list.addEventListener('dragleave', () => list.classList.remove('is-over'));
      list.addEventListener('drop', (event) => { event.preventDefault(); list.classList.remove('is-over'); const card = current.cards.find((item) => item.id === event.dataTransfer.getData('text/plain')); if (card) { card.stageId = stage.id; save(); render(); } });
      column.append(title, list); return column;
    }));
  }
  function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value || ''; return node.innerHTML; }
  function render() { updateAreaOptions(); renderStages(); renderBoard(); }
  function openModal(stageId) { const current = area(); cardStage.replaceChildren(...current.stages.map((stage) => new Option(stage.name, stage.id, stage.id === stageId, stage.id === stageId))); el('crmCardForm').reset(); if (stageId) cardStage.value = stageId; modal.hidden = false; el('crmCardName').focus(); }
  function closeModal() { modal.hidden = true; }

  areaSelect.addEventListener('change', () => { state.currentAreaId = areaSelect.value; save(); render(); });
  templateSelect.addEventListener('change', () => { templateDescription.textContent = CRM_TEMPLATES[templateSelect.value].description; });
  el('applyTemplate').addEventListener('click', () => {
    const current = area(); const template = CRM_TEMPLATES[templateSelect.value];
    if (templateSelect.value === 'custom') { current.template = 'custom'; save(); render(); return; }
    if (current.cards.length && !confirm('Aplicar este modelo substituirá as etapas atuais. Os cards existentes serão movidos para a primeira etapa. Continuar?')) return;
    current.template = templateSelect.value;
    current.stages = template.stages.map((name) => ({ id: makeId('stage'), name }));
    current.cards.forEach((card) => { card.stageId = current.stages[0].id; });
    save(); render();
  });
  el('renameArea').addEventListener('click', () => { const name = el('crmAreaRename').value.trim(); if (!name) return el('crmAreaRename').focus(); area().name = name; save(); render(); });
  el('addArea').addEventListener('click', () => { const name = el('crmAreaName').value.trim(); if (!name) return el('crmAreaName').focus(); const id = makeId('area'); const template = CRM_TEMPLATES[templateSelect.value]; const stages = template.stages.length ? template.stages.map((stageName) => ({ id: makeId('stage'), name: stageName })) : [{ id: `${id}-entrada`, name: 'Entrada' }]; state.areas.push({ id, name, template: templateSelect.value, stages, cards: [] }); state.currentAreaId = id; el('crmAreaName').value = ''; save(); render(); });
  el('addStage').addEventListener('click', () => { const name = el('crmStageName').value.trim(); if (!name) return el('crmStageName').focus(); area().stages.push({ id: makeId('stage'), name }); el('crmStageName').value = ''; save(); render(); });
  el('openCardModal').addEventListener('click', () => openModal(area().stages[0].id));
  el('closeCardModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  el('crmCardForm').addEventListener('submit', (event) => { event.preventDefault(); area().cards.push({ id: makeId('card'), stageId: cardStage.value, name: el('crmCardName').value.trim(), contact: el('crmCardContact').value.trim(), value: el('crmCardValue').value.trim() }); save(); closeModal(); render(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
  render();
}());
