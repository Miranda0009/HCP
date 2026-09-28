const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../js/crm-api.js');

const root = path.resolve(__dirname, '..');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260928225232_create_private_and_shared_crm_boards.sql'), 'utf8');
const html = fs.readFileSync(path.join(root, 'html/crm.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js/crm.js'), 'utf8');
const usernameSql = fs.readFileSync(path.join(root, 'supabase/migrations/20260928232105_add_hcp_usernames_and_invitations.sql'), 'utf8');
const profileHtml = fs.readFileSync(path.join(root, 'html/perfil.html'), 'utf8');

test('um CRM novo é válido e não tem oportunidades fictícias', () => {
  const board = api.defaultBoard(() => 'stage-' + Math.random());
  assert.equal(board.cards.length, 0);
  assert.equal(api.validateBoard(board).stages.length, 4);
});

test('seletor de empresa só lista vínculos reais e destaca nomes genéricos', async () => {
  const client = { from(table) {
    if (table === 'account_memberships') return { select: async () => ({ data: [
      { account_id: 'company-1', role: 'owner' }, { account_id: 'company-2', role: 'member' }
    ], error: null }) };
    return { select: () => ({ in: async () => ({ data: [
      { id: 'company-1', company_name: 'Acme' }, { id: 'company-2', company_name: 'Conta HCP' }
    ], error: null }) }) };
  } };
  const workspaces = await api.create(client).workspaces();
  assert.deepEqual(workspaces.map(({ name, needsCompanyName }) => ({ name, needsCompanyName })), [
    { name: 'Acme', needsCompanyName: false },
    { name: 'Nome da empresa não definido', needsCompanyName: true }
  ]);
});

test('backup local só importa dados com etapas e cards coerentes', () => {
  const board = api.defaultBoard(() => 'stage-' + Math.random());
  board.cards.push({ id: 'card-1', stageId: board.stages[0].id, name: 'Cliente de teste', contact: '', value: '', note: '' });
  assert.equal(api.boardFromLegacyArea(board).cards[0].name, 'Cliente de teste');
  board.cards[0].stageId = 'etapa-inexistente';
  assert.throws(() => api.boardFromLegacyArea(board), /oportunidade incorreta/);
});

test('migração separa CRM privado de compartilhado por empresa e criador', () => {
  assert.match(sql, /create table public\.crm_boards/i);
  assert.match(sql, /account_id uuid not null references public\.accounts/i);
  assert.match(sql, /owner_user_id uuid not null references auth\.users/i);
  assert.match(sql, /visibility text not null default 'private'/i);
  assert.match(sql, /alter table public\.crm_boards enable row level security/i);
  assert.match(sql, /owner_user_id = \(select auth\.uid\(\)\) or visibility = 'team'/i);
  assert.match(sql, /crm_visibility_owner_only/i);
  assert.match(sql, /grant update \(name, template, visibility, stages, cards\)/i);
  assert.match(sql, /create policy crm_boards_delete[\s\S]+owner_user_id = \(select auth\.uid\(\)\)/i);
});

test('convites precisam ser aceitos pela conta com e-mail verificado', () => {
  assert.match(sql, /public\.hcp_create_account_invitation/);
  assert.match(sql, /public\.hcp_accept_account_invitation/);
  assert.match(sql, /email_confirmed_at is not null/);
  assert.match(sql, /v_invitation\.email <> v_email/);
  assert.match(sql, /role\)\s*values\(v_invitation\.account_id, v_user_id, 'member'\)/i);
});

test('interface faz persistência remota, backup, restauração e não importa legado automaticamente', () => {
  assert.match(html, /id="crmVisibility"/);
  assert.match(html, /id="crmInviteEmail"/);
  assert.match(html, /id="crmExport"/);
  assert.match(html, /id="crmWorkspaceHint"/);
  assert.match(html, /O tipo define as etapas sugeridas na criação/);
  assert.match(html, /id="crmVisibility"/);
  assert.match(html, /id="crmRestore"/);
  assert.match(html, /js\/crm-api\.js/);
  assert.match(script, /await api\.boards\(workspace\.id\)/);
  assert.match(script, /await api\.save\(board, draft\)/);
  assert.match(script, /await api\.remove\(board\)/);
  assert.match(script, /window\.HCPCrmStorage\?\.readLegacy\(localStorage, userId\)/);
  assert.match(script, /formato antigo não identificava o dono/i);
  assert.match(script, /if \(!current\(\) \|\| busy\) return;/);
  assert.match(script, /newBoardVisibility/);
  assert.doesNotMatch(script, /migrateLegacy/i);
});

test('convite por @usuário exige identificador único e autorização de administrador', () => {
  assert.match(usernameSql, /create unique index profiles_username_unique/i);
  assert.match(usernameSql, /username ~ '\^\[a-z\]/i);
  assert.match(usernameSql, /m\.role in \('owner', 'admin'\)/i);
  assert.match(usernameSql, /u\.email_confirmed_at is not null/i);
  assert.match(usernameSql, /perform public\.hcp_create_account_invitation/i);
  assert.match(usernameSql, /grant execute on function public\.hcp_create_account_invitation_by_username\(uuid,text\)\s+to authenticated/i);
  assert.match(profileHtml, /id="profileUsername"/);
  assert.match(html, /id="crmInviteMethod"/);
  assert.match(html, /id="crmInviteUsername"/);
});

test('cliente convida pelo @usuário sem revelar o e-mail da pessoa', async () => {
  const calls = [];
  const client = { from() {}, async rpc(name, args) { calls.push({ name, args }); return { data: 'alisson_hcp', error: null }; } };
  const crm = api.create(client);
  assert.equal(await crm.inviteByUsername('empresa-1', ' @Alisson_HCP '), 'alisson_hcp');
  assert.deepEqual(calls, [{ name: 'hcp_create_account_invitation_by_username', args: {
    p_account_id: 'empresa-1', p_username: 'alisson_hcp'
  } }]);
  await assert.rejects(crm.inviteByUsername('empresa-1', '@x'), /@usuário HCP válido/);
  assert.equal(calls.length, 1);
});
