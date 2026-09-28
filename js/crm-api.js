(function exposeCrmApi(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HCPCrmApi = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCrmApi() {
  const MAX_BYTES = 1024 * 1024;
  const TEMPLATES = Object.freeze({
    sales: ['Lead novo', 'Contato feito', 'Diagnóstico', 'Proposta enviada', 'Negociação', 'Fechado'],
    success: ['Onboarding', 'Adoção', 'Acompanhamento', 'Expansão', 'Renovação'],
    recruitment: ['Triagem', 'Entrevista inicial', 'Entrevista técnica', 'Proposta', 'Contratado'],
    custom: ['Entrada']
  });

  function validText(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
  function optionalText(value, max) { return value == null || (typeof value === 'string' && value.length <= max); }
  function validateBoard(value) {
    if (!value || !validText(value.name, 70) || !TEMPLATES[value.template]
      || !Array.isArray(value.stages) || !value.stages.length || value.stages.length > 30
      || !Array.isArray(value.cards) || value.cards.length > 500) {
      throw new Error('CRM inválido: nome, tipo ou estrutura incorretos.');
    }
    const stages = value.stages.map((stage) => {
      if (!stage || !validText(stage.id, 120) || !validText(stage.name, 40)) throw new Error('CRM inválido: etapa incorreta.');
      return { id: stage.id, name: stage.name };
    });
    const stageIds = new Set(stages.map((stage) => stage.id));
    if (stageIds.size !== stages.length) throw new Error('CRM inválido: etapas duplicadas.');
    const cards = value.cards.map((card) => {
      if (!card || !validText(card.id, 120) || !stageIds.has(card.stageId) || !validText(card.name, 70)
        || !optionalText(card.contact, 80) || !optionalText(card.value, 20) || !optionalText(card.note, 500)) {
        throw new Error('CRM inválido: oportunidade incorreta.');
      }
      return { id: card.id, stageId: card.stageId, name: card.name,
        contact: card.contact || '', value: card.value || '', note: card.note || '' };
    });
    if (new Set(cards.map((card) => card.id)).size !== cards.length) throw new Error('CRM inválido: oportunidades duplicadas.');
    const clean = { name: value.name.trim(), template: value.template, stages, cards };
    if (new TextEncoder().encode(JSON.stringify(clean)).length > MAX_BYTES) throw new Error('CRM excede o limite de 1 MB.');
    return clean;
  }

  function defaultBoard(idFactory) {
    return { name: 'Vendas B2B', template: 'sales',
      stages: ['Novas oportunidades', 'Qualificação', 'Proposta enviada', 'Fechado'].map((name) => ({ id: idFactory(), name })), cards: [] };
  }
  function boardFromLegacyArea(area) {
    return validateBoard({ name: area?.name, template: TEMPLATES[area?.template] ? area.template : 'custom', stages: area?.stages, cards: area?.cards });
  }
  function errorMessage(error) { return error?.message || 'Não foi possível acessar o CRM.'; }
  function conflict() { const error = new Error('Este CRM foi alterado em outra sessão. Os dados serão recarregados; refaça sua alteração.'); error.code = 'CONFLICT'; return error; }

  function create(client) {
    if (!client || typeof client.from !== 'function') throw new Error('Conexão com o banco indisponível.');
    return {
      async workspaces() {
        const memberships = await client.from('account_memberships').select('account_id, role');
        if (memberships.error) throw new Error(errorMessage(memberships.error));
        if (!memberships.data?.length) throw new Error('Esta conta ainda não pertence a um espaço de trabalho.');
        const accounts = await client.from('accounts').select('id, company_name').in('id', memberships.data.map((item) => item.account_id));
        if (accounts.error) throw new Error(errorMessage(accounts.error));
        return memberships.data.map((item) => {
          const rawName = accounts.data?.find((account) => account.id === item.account_id)?.company_name?.trim() || '';
          const needsCompanyName = !rawName || ['conta hcp', 'conta local do hcp', 'hcp local', 'espaço de trabalho'].includes(rawName.toLocaleLowerCase('pt-BR'));
          return { id: item.account_id, role: item.role,
            name: needsCompanyName ? 'Nome da empresa não definido' : rawName, needsCompanyName };
        });
      },
      async boards(accountId) {
        const result = await client.from('crm_boards').select('id, account_id, owner_user_id, name, template, visibility, stages, cards, revision, updated_at')
          .eq('account_id', accountId).order('created_at', { ascending: true });
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data || [];
      },
      async add(accountId, userId, board) {
        const clean = validateBoard(board);
        const result = await client.from('crm_boards').insert({ account_id: accountId, owner_user_id: userId, visibility: 'private', ...clean })
          .select('id, account_id, owner_user_id, name, template, visibility, stages, cards, revision, updated_at').single();
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data;
      },
      async save(board, changes) {
        const clean = validateBoard(changes);
        const result = await client.from('crm_boards').update(clean).eq('id', board.id).eq('account_id', board.account_id).eq('revision', board.revision)
          .select('id, account_id, owner_user_id, name, template, visibility, stages, cards, revision, updated_at').maybeSingle();
        if (result.error) throw new Error(errorMessage(result.error));
        if (!result.data) throw conflict();
        return result.data;
      },
      async share(board, visibility) {
        if (!['private', 'team'].includes(visibility)) throw new Error('Visibilidade inválida.');
        const result = await client.from('crm_boards').update({ visibility }).eq('id', board.id).eq('account_id', board.account_id).eq('revision', board.revision)
          .select('id, account_id, owner_user_id, name, template, visibility, stages, cards, revision, updated_at').maybeSingle();
        if (result.error) throw new Error(errorMessage(result.error));
        if (!result.data) throw conflict();
        return result.data;
      },
      async remove(board) {
        const result = await client.from('crm_boards').delete().eq('id', board.id).eq('account_id', board.account_id).eq('revision', board.revision)
          .select('id').maybeSingle();
        if (result.error) throw new Error(errorMessage(result.error));
        if (!result.data) throw conflict();
      },
      async invite(accountId, email) {
        const normalized = String(email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 320) throw new Error('Informe um e-mail válido.');
        const result = await client.rpc('hcp_create_account_invitation', { p_account_id: accountId, p_email: normalized });
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data;
      },
      async inviteByUsername(accountId, username) {
        const normalized = String(username || '').trim().replace(/^@/, '').toLowerCase();
        if (!/^[a-z][a-z0-9_]{2,29}$/.test(normalized)) throw new Error('Informe um @usuário HCP válido.');
        const result = await client.rpc('hcp_create_account_invitation_by_username', {
          p_account_id: accountId, p_username: normalized
        });
        if (result.error) {
          if (result.error.message?.includes('hcp_user_not_found')) throw new Error('Usuário HCP não encontrado ou sem e-mail confirmado.');
          throw new Error(errorMessage(result.error));
        }
        return result.data;
      },
      async pendingInvitations() {
        const result = await client.from('account_invitations').select('id, account_id, email, created_at, expires_at, accounts(company_name)')
          .is('accepted_at', null).gt('expires_at', new Date().toISOString());
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data || [];
      },
      async acceptInvitation(invitationId) {
        const result = await client.rpc('hcp_accept_account_invitation', { p_invitation_id: invitationId });
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data;
      }
    };
  }

  return { TEMPLATES, defaultBoard, validateBoard, boardFromLegacyArea, create };
});
