(function () {
  'use strict';

  const templates = {
    sales: { label: 'Vendas', description: 'Modelo de vendas para oportunidades comerciais.' },
    success: { label: 'Sucesso do cliente', description: 'Modelo para onboarding, saúde e renovação.' },
    recruitment: { label: 'Recrutamento', description: 'Modelo para candidatos em seleção.' },
    custom: { label: 'Personalizado', description: 'Defina as etapas conforme sua operação.' }
  };
  const el = (id) => document.getElementById(id);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const makeId = () => (globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const setStatus = (text, tone = '') => { el('crmSyncStatus').textContent = text; el('crmSyncStatus').dataset.tone = tone; };
  const escapeHtml = (value) => { const node = document.createElement('span'); node.textContent = String(value || ''); return node.innerHTML; };
  let api, userId, workspaces = [], workspace, boards = [], currentId, busy = false, editingCardId = null;
  let view = 'kanban';
  let preview = false;
  let newBoardVisibility = 'private';

  function current() { return boards.find((board) => board.id === currentId) || null; }
  function isOwner(board = current()) { return board?.owner_user_id === userId; }
  function setBusy(value) {
    busy = value;
    el('crmWorkspaceSelect').disabled = value || workspaces.length < 2;
    el('crmExport').disabled = value || !current();
    el('crmImport').disabled = value || !workspace;
    el('crmRestore').disabled = value || !workspace;
    el('crmDeleteAll').disabled = value || !isOwner();
    el('openCardModal').disabled = value || !current();
    el('crmInvite').disabled = value || preview || !workspace || !['owner', 'admin'].includes(workspace.role);
    el('crmInviteMethod').disabled = value;
    el('crmVisibility').disabled = value || !workspace || (Boolean(current()) && !isOwner());
    el('crmAreaSelect').disabled = value || !boards.length;
    el('crmWorkspaceSelect').title = workspaces.length < 2
      ? 'Para selecionar outra empresa, sua conta precisa estar vinculada a ela.'
      : 'Escolha entre as empresas às quais sua conta pertence.';
    el('crmExport').title = current() ? 'Baixar um arquivo JSON do CRM selecionado.' : 'Crie ou selecione um CRM antes de baixar o backup.';
    el('crmDeleteAll').title = !current() ? 'Crie ou selecione um CRM para excluí-lo.'
      : isOwner() ? 'Exclui permanentemente o CRM selecionado e seus cards.' : 'Somente quem criou este CRM pode excluí-lo.';
    el('applyTemplate').title = current()
      ? 'Substitui as etapas deste CRM e move os cards para a primeira etapa.'
      : 'O tipo escolhido gera as etapas iniciais quando você cria um CRM.';
    el('crmConfigTitle').closest('.crm-config').querySelectorAll('button, input').forEach((element) => {
      if (['crmInvite', 'crmImportFile'].includes(element.id)) return;
      element.disabled = value || (!['addArea', 'crmAreaName', 'crmInviteEmail', 'crmInviteUsername'].includes(element.id) && !current());
    });
  }
  function previewKey() { return `hcp-crm-preview-v2:${userId}`; }
  function readPreview() { try { return JSON.parse(localStorage.getItem(previewKey()) || '[]'); } catch { return []; } }
  function writePreview() { localStorage.setItem(previewKey(), JSON.stringify(boards)); }

  async function refreshBoards(preferredId) {
    boards = preview ? readPreview() : await api.boards(workspace.id);
    currentId = boards.some((board) => board.id === preferredId) ? preferredId : (boards[0]?.id || null);
    render();
  }
  async function selectWorkspace(id) {
    if (busy) return;
    workspace = workspaces.find((item) => item.id === id);
    if (!workspace) return;
    setBusy(true); setStatus('Carregando CRMs...');
    try {
      boards = []; currentId = null; render();
      await refreshBoards();
      try { localStorage.setItem(`hcp-crm-active-workspace:${userId}`, id); } catch { /* preferência opcional */ }
      setStatus(`${workspace.name} · ${boards.length} CRM(s) disponível(is).`, 'success');
      await renderInvitations();
    } catch (error) { setStatus(error.message, 'error'); }
    finally { setBusy(false); }
  }

  function render() {
    const board = current();
    el('crmWorkspaceSelect').replaceChildren(...workspaces.map((item) => new Option(item.name, item.id, item.id === workspace?.id, item.id === workspace?.id)));
    const workspaceHint = el('crmWorkspaceHint');
    workspaceHint.replaceChildren();
    if (workspaces.length > 1) {
      workspaceHint.textContent = 'Selecione uma empresa à qual sua conta já está vinculada. Para outra, aceite um convite da equipe.';
    } else if (workspace?.needsCompanyName) {
      workspaceHint.append('O nome atual é genérico. ');
      const editCompany = document.createElement('a'); editCompany.href = 'perfil.html'; editCompany.textContent = 'Defina o nome da empresa em Minha conta';
      workspaceHint.append(editCompany, '. Para acessar outra empresa, aceite um convite da equipe.');
    } else {
      workspaceHint.textContent = workspace
        ? 'Esta conta está vinculada a uma empresa. Para escolher outra, aceite um convite da equipe.'
        : 'Entre em uma conta vinculada a uma empresa para carregar os CRMs.';
    }
    el('crmAreaSelect').replaceChildren(...boards.map((item) => new Option(`${item.name}${item.visibility === 'private' ? ' · privado' : ' · equipe'}`, item.id, item.id === currentId, item.id === currentId)));
    el('crmStageList').replaceChildren();
    el('crmColumns').replaceChildren();
    el('crmStageFilter').replaceChildren(new Option('Todas as etapas', ''), ...(board?.stages || []).map((stage) => new Option(stage.name, stage.id)));
    document.querySelectorAll('[data-crm-view]').forEach((button) => {
      const active = button.dataset.crmView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (!board) {
      const empty = document.createElement('p'); empty.className = 'crm-empty'; empty.textContent = 'Nenhum CRM neste espaço. Dê um nome em “Novo CRM” e clique em Criar.';
      el('crmColumns').append(empty);
      el('crmAreaRename').value = '';
      el('crmVisibility').value = newBoardVisibility;
      el('crmVisibilityHint').textContent = newBoardVisibility === 'team'
        ? 'O próximo CRM será criado privado e compartilhado com a equipe logo depois.'
        : 'O próximo CRM será privado. Você pode escolher compartilhá-lo com a equipe.';
      setBusy(busy); return;
    }
    el('crmAreaRename').value = board.name;
    el('crmTemplate').value = board.template;
    el('crmTemplateDescription').textContent = templates[board.template]?.description || templates.custom.description;
    el('crmVisibility').value = board.visibility;
    el('crmVisibilityHint').textContent = isOwner(board)
      ? (board.visibility === 'team' ? 'Membros desta empresa podem ver e editar.' : 'Somente sua conta pode ver este CRM.')
      : 'Compartilhado pela equipe. Só o criador altera a visibilidade ou exclui.';
    board.stages.forEach((stage) => {
      const row = document.createElement('div'); row.className = 'crm-stage-row';
      const input = document.createElement('input'); input.value = stage.name; input.maxLength = 40; input.setAttribute('aria-label', `Nome da etapa ${stage.name}`);
      input.addEventListener('change', () => {
        const name = input.value.trim(); if (!name) { input.value = stage.name; return; }
        mutate((draft) => { draft.stages.find((item) => item.id === stage.id).name = name; });
      });
      const count = document.createElement('small'); count.textContent = `(${board.cards.filter((card) => card.stageId === stage.id).length})`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.title = 'Excluir etapa';
      remove.setAttribute('aria-label', `Excluir etapa ${stage.name}`); remove.disabled = board.stages.length === 1;
      remove.addEventListener('click', () => {
        if (!confirm(`Excluir a etapa “${stage.name}”? Os cards vão para a primeira etapa.`)) return;
        mutate((draft) => {
          const fallback = draft.stages.find((item) => item.id !== stage.id);
          draft.cards.forEach((card) => { if (card.stageId === stage.id) card.stageId = fallback.id; });
          draft.stages = draft.stages.filter((item) => item.id !== stage.id);
        });
      });
      row.append(input, count, remove); el('crmStageList').append(row);
    });
    const query = el('crmSearch').value.trim().toLocaleLowerCase('pt-BR');
    const stageFilter = el('crmStageFilter').dataset.selected || '';
    el('crmStageFilter').value = board.stages.some((stage) => stage.id === stageFilter) ? stageFilter : '';
    const visibleCards = board.cards.filter((card) => (!stageFilter || card.stageId === stageFilter)
      && (!query || [card.name, card.contact, card.note, card.value].some((field) => String(field || '').toLocaleLowerCase('pt-BR').includes(query))));
    if (view === 'list') {
      el('crmColumns').className = 'crm-list';
      if (!visibleCards.length) { const empty = document.createElement('p'); empty.className = 'crm-empty'; empty.textContent = 'Nenhuma oportunidade corresponde à busca.'; el('crmColumns').append(empty); }
      visibleCards.forEach((card) => {
        const item = renderCard(card);
        item.dataset.stageName = board.stages.find((stage) => stage.id === card.stageId)?.name || '';
        el('crmColumns').append(item);
      });
      setBusy(busy); return;
    }
    if (view === 'reports') {
      el('crmColumns').className = 'crm-reports';
      board.stages.filter((stage) => !stageFilter || stage.id === stageFilter).forEach((stage) => {
        const count = visibleCards.filter((card) => card.stageId === stage.id).length;
        const tile = document.createElement('article'); tile.className = 'crm-report';
        const name = document.createElement('span'); name.textContent = stage.name;
        const total = document.createElement('strong'); total.textContent = String(count);
        const label = document.createElement('span'); label.textContent = count === 1 ? 'oportunidade' : 'oportunidades';
        tile.append(name, total, label); el('crmColumns').append(tile);
      });
      setBusy(busy); return;
    }
    el('crmColumns').className = 'crm-columns';
    board.stages.forEach((stage, index) => {
      const column = document.createElement('section'); column.className = 'crm-column'; column.dataset.stageIndex = String(index);
      const cards = visibleCards.filter((card) => card.stageId === stage.id);
      const head = document.createElement('div'); head.className = 'crm-column-head';
      head.innerHTML = `<div class="crm-column-title"><h2>${escapeHtml(stage.name)}</h2><span class="crm-column-count">${cards.length}</span></div>`;
      const add = document.createElement('button'); add.type = 'button'; add.className = 'crm-icon-btn'; add.title = 'Adicionar oportunidade nesta etapa'; add.textContent = '+';
      add.addEventListener('click', () => openModal(null, stage.id)); head.append(add);
      const list = document.createElement('div'); list.className = 'crm-card-list'; list.dataset.stageId = stage.id;
      if (!cards.length) { const empty = document.createElement('p'); empty.className = 'crm-empty'; empty.textContent = 'Arraste oportunidades para cá.'; list.append(empty); }
      cards.forEach((card) => list.append(renderCard(card)));
      list.addEventListener('dragover', (event) => { event.preventDefault(); list.classList.add('is-over'); event.dataTransfer.dropEffect = 'move'; });
      list.addEventListener('dragleave', () => list.classList.remove('is-over'));
      list.addEventListener('drop', (event) => {
        event.preventDefault(); list.classList.remove('is-over'); const id = event.dataTransfer.getData('text/plain');
        if (board.cards.some((card) => card.id === id)) mutate((draft) => { draft.cards.find((card) => card.id === id).stageId = stage.id; });
      });
      column.append(head, list); el('crmColumns').append(column);
    });
    setBusy(busy);
  }
  function renderCard(card) {
    const item = document.createElement('article'); item.className = 'crm-card'; item.draggable = true;
    const initials = card.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    item.innerHTML = `<div class="crm-card-top"><div class="crm-card-identity"><span class="crm-card-avatar">${escapeHtml(initials)}</span><div class="crm-card-title"><h3>${escapeHtml(card.name)}</h3><span>${escapeHtml(card.contact || 'Contato ainda não definido')}</span></div></div><div><button type="button" data-action="edit" aria-label="Editar ${escapeHtml(card.name)}" title="Editar">✎</button><button type="button" data-action="delete" aria-label="Excluir ${escapeHtml(card.name)}" title="Excluir">×</button></div></div><p class="crm-card-note">${escapeHtml(card.note || 'Acompanhar o próximo passo comercial.')}</p><div class="crm-card-meta"><span>Oportunidade</span><span class="crm-card-value">${escapeHtml(card.value || 'Sem valor')}</span></div>`;
    item.addEventListener('dragstart', (event) => { item.classList.add('dragging'); event.dataTransfer.setData('text/plain', card.id); });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.querySelector('[data-action="edit"]').addEventListener('click', () => openModal(card));
    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
      if (confirm(`Excluir ${card.name} do CRM?`)) mutate((draft) => { draft.cards = draft.cards.filter((entry) => entry.id !== card.id); });
    });
    return item;
  }

  async function mutate(change) {
    const board = current(); if (!board || busy) return;
    const draft = clone({ name: board.name, template: board.template, stages: board.stages, cards: board.cards });
    try { change(draft); window.HCPCrmApi.validateBoard(draft); }
    catch (error) { setStatus(error.message, 'error'); return; }
    setBusy(true); setStatus('Salvando CRM...');
    try {
      const saved = preview ? { ...board, ...draft, revision: board.revision + 1 } : await api.save(board, draft);
      boards = boards.map((item) => item.id === saved.id ? saved : item);
      if (preview) writePreview();
      render(); setStatus('Alterações salvas no espaço de trabalho.', 'success');
    } catch (error) { await recover(error); }
    finally { setBusy(false); }
  }
  async function recover(error) {
    if (error.code === 'CONFLICT') { try { await refreshBoards(currentId); } catch { /* não oculta o conflito */ } }
    setStatus(error.message, 'error');
  }

  function openModal(card, stageId) {
    const board = current(); if (!board || busy) return;
    editingCardId = card?.id || null;
    el('crmCardForm').reset();
    el('crmModalTitle').textContent = card ? 'Editar oportunidade' : 'Nova oportunidade';
    el('crmCardSubmit').textContent = card ? 'Salvar alterações' : 'Adicionar oportunidade';
    el('crmCardName').value = card?.name || '';
    el('crmCardContact').value = card?.contact || '';
    el('crmCardValue').value = card?.value || '';
    el('crmCardNote').value = card?.note || '';
    el('crmCardStage').replaceChildren(...board.stages.map((stage) => new Option(stage.name, stage.id)));
    el('crmCardStage').value = card?.stageId || stageId || board.stages[0].id;
    el('crmModal').hidden = false; el('crmCardName').focus();
  }
  function closeModal() { el('crmModal').hidden = true; editingCardId = null; }

  async function addBoard(boardData, visibility = 'private') {
    if (!workspace || busy) return;
    const clean = window.HCPCrmApi.validateBoard(boardData);
    setBusy(true); setStatus('Criando CRM privado...');
    try {
      let saved = preview ? { ...clean, id: makeId(), account_id: workspace.id, owner_user_id: userId, visibility: 'private', revision: 1 }
        : await api.add(workspace.id, userId, clean);
      if (visibility === 'team') {
        try {
          saved = preview ? { ...saved, visibility: 'team', revision: saved.revision + 1 } : await api.share(saved, 'team');
        } catch (error) {
          boards.push(saved); currentId = saved.id;
          if (preview) writePreview();
          render(); setStatus(`CRM criado como privado; não foi possível compartilhar: ${error.message}`, 'error');
          return saved;
        }
      }
      boards.push(saved); currentId = saved.id;
      if (preview) writePreview();
      render(); setStatus(visibility === 'team' ? 'CRM criado e compartilhado com a equipe.' : 'CRM privado criado.', 'success');
      return saved;
    } catch (error) { setStatus(error.message, 'error'); return null; }
    finally { setBusy(false); }
  }

  async function renderInvitations() {
    const target = el('crmInvitations'); target.replaceChildren();
    if (preview) return;
    const invitations = await api.pendingInvitations();
    invitations.filter((invite) => !workspaces.some((item) => item.id === invite.account_id)).forEach((invite) => {
      const row = document.createElement('div'); row.className = 'crm-stage-row';
      const label = document.createElement('span'); label.textContent = `Convite de ${invite.accounts?.company_name || 'outra empresa'}`;
      const accept = document.createElement('button'); accept.type = 'button'; accept.textContent = 'Aceitar';
      accept.addEventListener('click', async () => {
        if (!confirm('Aceitar o convite para esta empresa? Você verá os CRMs compartilhados pela equipe.')) return;
        try {
          await api.acceptInvitation(invite.id);
          workspaces = await api.workspaces();
          await selectWorkspace(invite.account_id);
          setStatus('Convite aceito. Seus CRMs privados continuam visíveis apenas para você.', 'success');
        } catch (error) { setStatus(error.message, 'error'); }
      });
      row.append(label, accept); target.append(row);
    });
  }

  function downloadBackup() {
    const board = current(); if (!board) return;
    const backup = { format: 'hcp-crm-board-v1', exportedAt: new Date().toISOString(), board: {
      name: board.name, template: board.template, stages: board.stages, cards: board.cards } };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `hcp-crm-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setStatus('Backup deste CRM baixado. Guarde o arquivo em local seguro.', 'success');
  }

  async function initialize() {
    let profile = null;
    try { profile = await Promise.resolve(window.hcpProfileReady); } catch { /* exibe erro abaixo */ }
    userId = window.hcpCurrentUser?.id || profile?.id;
    preview = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
      && new URLSearchParams(window.location.search).has('preview');
    if (!userId || !window.HCPCrmApi || (!preview && !window.hcpSupabase)) {
      setStatus('Entre na sua conta para acessar o CRM.', 'error'); return;
    }
    try {
      if (preview) workspaces = [{ id: 'hcp-local-preview', name: 'Prévia local', role: 'owner' }];
      else { api = window.HCPCrmApi.create(window.hcpSupabase); workspaces = await api.workspaces(); }
      let preferred = null;
      try { preferred = localStorage.getItem(`hcp-crm-active-workspace:${userId}`); } catch { /* opcional */ }
      await selectWorkspace(workspaces.some((item) => item.id === preferred) ? preferred : (workspaces.find((item) => item.id === userId)?.id || workspaces[0].id));
    } catch (error) { setStatus(error.message, 'error'); }
  }

  el('crmWorkspaceSelect').addEventListener('change', (event) => selectWorkspace(event.target.value));
  document.querySelectorAll('[data-crm-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.crmView; render(); }));
  el('crmSearch').addEventListener('input', render);
  el('crmStageFilter').addEventListener('change', (event) => { event.target.dataset.selected = event.target.value; render(); });
  el('crmAreaSelect').addEventListener('change', (event) => { currentId = event.target.value; render(); });
  el('crmTemplate').addEventListener('change', (event) => { el('crmTemplateDescription').textContent = templates[event.target.value]?.description || ''; });
  el('applyTemplate').addEventListener('click', () => {
    if (!current() || busy) return;
    const template = el('crmTemplate').value;
    if (current().cards.length && !confirm('Trocar o modelo substituirá as etapas e moverá todos os cards para a primeira. Continuar?')) return;
    mutate((draft) => {
      draft.template = template;
      draft.stages = window.HCPCrmApi.TEMPLATES[template].map((name) => ({ id: makeId(), name }));
      draft.cards.forEach((card) => { card.stageId = draft.stages[0].id; });
    });
  });
  el('renameArea').addEventListener('click', () => {
    const name = el('crmAreaRename').value.trim(); if (!name) return el('crmAreaRename').focus();
    mutate((draft) => { draft.name = name; });
  });
  el('addArea').addEventListener('click', async () => {
    const name = el('crmAreaName').value.trim(); if (!name) return el('crmAreaName').focus();
    try {
      const template = el('crmTemplate').value;
      const stages = window.HCPCrmApi.TEMPLATES[template].map((stageName) => ({ id: makeId(), name: stageName }));
      if (newBoardVisibility === 'team' && !confirm('O novo CRM será compartilhado com todas as pessoas desta empresa que já são membros. Deseja continuar?')) return;
      if (await addBoard({ name, template, stages, cards: [] }, newBoardVisibility)) el('crmAreaName').value = '';
    } catch (error) { setStatus(error.message, 'error'); }
  });
  el('addStage').addEventListener('click', () => {
    const name = el('crmStageName').value.trim(); if (!name) return el('crmStageName').focus();
    mutate((draft) => { draft.stages.push({ id: makeId(), name }); }); el('crmStageName').value = '';
  });
  el('crmVisibility').addEventListener('change', async (event) => {
    const board = current(), visibility = event.target.value;
    if (!board) {
      newBoardVisibility = visibility;
      render();
      setStatus(visibility === 'team' ? 'O próximo CRM será compartilhado com a equipe.' : 'O próximo CRM será privado.', 'success');
      return;
    }
    if (!board || !isOwner(board) || busy) return render();
    if (visibility === 'team' && !confirm('Compartilhar este CRM? Todos os membros desta empresa poderão ver e editar cards e etapas.')) return render();
    setBusy(true); setStatus('Atualizando compartilhamento...');
    try {
      const saved = preview ? { ...board, visibility, revision: board.revision + 1 } : await api.share(board, visibility);
      boards = boards.map((item) => item.id === saved.id ? saved : item);
      if (preview) writePreview();
      render(); setStatus(visibility === 'team' ? 'CRM compartilhado com a equipe.' : 'CRM agora é visível só para sua conta.', 'success');
    } catch (error) { await recover(error); render(); }
    finally { setBusy(false); }
  });
  el('crmDeleteAll').addEventListener('click', async () => {
    const board = current(); if (!board || !isOwner(board) || busy) return;
    if (!confirm(`Excluir definitivamente o CRM “${board.name}” e seus cards? Baixe um backup antes se precisar recuperar.`)) return;
    setBusy(true); setStatus('Excluindo CRM...');
    try {
      if (!preview) await api.remove(board);
      boards = boards.filter((item) => item.id !== board.id);
      if (preview) writePreview();
      currentId = boards[0]?.id || null; render(); setStatus('CRM excluído.', 'success');
    } catch (error) { await recover(error); }
    finally { setBusy(false); }
  });
  el('crmInvite').addEventListener('click', async () => {
    if (!workspace || busy) return;
    try {
      if (el('crmInviteMethod').value === 'username') {
        await api.inviteByUsername(workspace.id, el('crmInviteUsername').value);
        el('crmInviteUsername').value = '';
      } else {
        await api.invite(workspace.id, el('crmInviteEmail').value);
        el('crmInviteEmail').value = '';
      }
      setStatus('Convite registrado. Nenhum e-mail é enviado automaticamente; peça à pessoa para abrir o CRM e aceitar.', 'success');
    } catch (error) { setStatus(error.message, 'error'); }
  });
  el('crmInviteMethod').addEventListener('change', (event) => {
    const byEmail = event.target.value === 'email';
    el('crmInviteEmail').hidden = !byEmail;
    el('crmInviteUsername').hidden = byEmail;
    el('crmInviteHint').textContent = byEmail
      ? 'Use o e-mail da conta HCP da pessoa. Ela deverá entrar no CRM e aceitar.'
      : 'Peça o @usuário que a pessoa definiu em Minha conta.';
  });
  el('crmExport').addEventListener('click', downloadBackup);
  el('crmImport').addEventListener('click', async () => {
    const importedData = window.HCPCrmStorage?.readLegacy(localStorage, userId);
    const legacy = importedData?.state;
    if (!legacy?.areas?.length) { setStatus('Nenhum dado antigo de CRM foi encontrado neste navegador. Se você tem um arquivo JSON, use “Restaurar backup”.', 'error'); return; }
    const ownershipNote = importedData.unscoped ? ' O formato antigo não identificava o dono; confirme que estes dados pertencem a você.' : '';
    if (!confirm(`Importar ${legacy.areas.length} área(s) como CRM(s) privados em “${workspace.name}”? Os dados locais serão preservados.${ownershipNote} Repetir criará cópias.`)) return;
    let imported = 0;
    for (const area of legacy.areas) {
      let candidate;
      try { candidate = window.HCPCrmApi.boardFromLegacyArea(area); }
      catch (error) { setStatus(`${imported} importado(s); erro: ${error.message}. Os dados locais foram preservados.`, 'error'); return; }
      if (!await addBoard(candidate)) { setStatus(`${imported} importado(s). Os dados locais foram preservados; revise o erro antes de tentar de novo.`, 'error'); return; }
      imported += 1;
    }
    setStatus(`${imported} CRM(s) importado(s) como privados. Os dados locais foram preservados.`, 'success');
  });
  el('crmRestore').addEventListener('click', () => el('crmImportFile').click());
  el('crmImportFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) { setStatus('Backup excede 1 MB.', 'error'); return; }
    try {
      const backup = JSON.parse(await file.text());
      if (backup.format !== 'hcp-crm-board-v1') throw new Error('Formato de backup não reconhecido.');
      const board = window.HCPCrmApi.validateBoard(backup.board);
      if (!confirm(`Restaurar “${board.name}” como um novo CRM privado?`)) return;
      await addBoard(board);
    } catch (error) { setStatus(error.message, 'error'); }
  });
  el('openCardModal').addEventListener('click', () => openModal(null));
  el('closeCardModal').addEventListener('click', closeModal);
  el('crmModal').addEventListener('click', (event) => { if (event.target === el('crmModal')) closeModal(); });
  el('crmCardForm').addEventListener('submit', async (event) => {
    event.preventDefault(); if (busy) return;
    const fields = { name: el('crmCardName').value.trim(), contact: el('crmCardContact').value.trim(),
      value: el('crmCardValue').value.trim(), note: el('crmCardNote').value.trim(), stageId: el('crmCardStage').value };
    await mutate((draft) => {
      const card = editingCardId ? draft.cards.find((entry) => entry.id === editingCardId) : null;
      if (card) Object.assign(card, fields); else draft.cards.push({ id: makeId(), ...fields });
    });
    if (el('crmSyncStatus').dataset.tone === 'success') closeModal();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !el('crmModal').hidden) closeModal(); });
  initialize();
}());
