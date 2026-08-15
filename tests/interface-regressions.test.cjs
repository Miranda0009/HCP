const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'js', 'script.js'), 'utf8');
const profileScript = fs.readFileSync(path.join(root, 'js', 'profile.js'), 'utf8');
const profileHtml = fs.readFileSync(path.join(root, 'html', 'perfil.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(root, 'html', 'login.html'), 'utf8');
const panelHtml = fs.readFileSync(path.join(root, 'html', 'painel.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');

test('perfil resolve a conta pelo vínculo e valida todas as gravações antes do sucesso', () => {
  assert.match(profileScript, /\.from\('account_memberships'\)/);
  assert.match(profileScript, /\.eq\('user_id', userId\)/);
  assert.match(profileScript, /const rolePriority = \{ owner: 0, admin: 1, member: 2 \}/);
  assert.match(profileScript, /\.eq\('id', membership\.account_id\)/);
  assert.match(profileScript, /if \(!account\)/);
  assert.match(profileScript, /error: authError/);
  assert.match(profileScript, /if \(authError\) throw authError/);
  assert.match(profileScript, /Object\.hasOwn\(profile, 'full_name'\)/);
  assert.match(profileScript, /then\(async \(profile\) => \{[\s\S]*fillForm\(profile\);[\s\S]*await loadAccountDetails\(\);/);
  assert.match(profileScript, /Workspace administrator/);
  assert.match(profileScript, /Workspace member/);
  assert.doesNotMatch(profileScript, /\.eq\('owner_user_id', user\.id\)/);
});

test('favoritos usam chaves por usuário e removem as chaves legadas após migrar', () => {
  assert.match(script, /favoriteListStorageBaseKey = 'hcp-favorite-lead-lists'/);
  assert.match(script, /hiddenNichesStorageBaseKey = 'hcp-hidden-favorite-niches'/);
  assert.match(script, /hiddenDefaultListStorageBaseKey = 'hcp-hide-default-favorite-list'/);
  assert.match(script, /favoriteListStorageKey = `\$\{favoriteListStorageBaseKey\}:\$\{userId\}`/);
  assert.match(script, /hiddenNichesStorageKey = `\$\{hiddenNichesStorageBaseKey\}:\$\{userId\}`/);
  assert.match(script, /hiddenDefaultListStorageKey = `\$\{hiddenDefaultListStorageBaseKey\}:\$\{userId\}`/);
  assert.match(script, /localStorage\.removeItem\(favoriteListStorageBaseKey\)/);
  assert.match(script, /await Promise\.resolve\(window\.hcpProfileReady\)/);
});

test('feedback e busca global recebem semântica acessível', () => {
  assert.match(script, /toast\.setAttribute\('role', 'status'\)/);
  assert.match(script, /toastStack\.setAttribute\('aria-live', 'polite'\)/);
  assert.match(script, /commandModal\.setAttribute\('role', 'dialog'\)/);
  assert.match(script, /commandModal\.setAttribute\('aria-modal', 'true'\)/);
  assert.match(script, /commandModal\.setAttribute\('aria-labelledby', commandDialogTitle\.id\)/);
  assert.match(script, /"Pesquisar empresas, segmentos, cidades\.\.\.": "Search companies, segments, cities\.\.\."/);
  assert.match(script, /window\.addEventListener\('hcp:plan-selected'/);
});

test('accordions e switches do perfil têm relações e nomes acessíveis', () => {
  for (const id of [
    'profileDetailsAccordionBody',
    'monthlyUsageAccordionBody',
    'passwordAccordionBody',
    'notificationsAccordionBody'
  ]) {
    assert.match(profileHtml, new RegExp(`aria-controls="${id}"`));
    assert.match(profileHtml, new RegExp(`id="${id}"`));
  }
  assert.match(profileHtml, /data-setting-key="weekly-digest"/);
  assert.match(profileHtml, /aria-labelledby="weeklyDigestLabel"/);
  assert.match(script, /hcp-user-setting:\$\{userId\}:\$\{setting\}/);
});

test('conteúdo anual e favoritos são recalculados ao trocar idioma', () => {
  assert.match(script, /updateBillingCycle\(activeCycle, \{ persist: false, syncLanguage: false \}\)/);
  assert.match(script, /formatFavoriteSavedDate/);
  assert.match(script, /syncFavoriteDynamicLanguage/);
  assert.match(script, /favoriteCopy\('Ocultar empresas', 'Hide companies'\)/);
});

test('sugestões de nicho do cadastro traduzem e restauram o atributo value', () => {
  assert.match(loginHtml, /<datalist id="signupNicheSuggestions" data-translate-values>/);
  assert.match(script, /"Agência de Marketing": "Marketing Agency"/);
  assert.match(script, /"Consultoria Comercial \/ SDR \/ BDR": "Sales Consulting \/ SDR \/ BDR"/);
  assert.match(script, /"BPO Financeiro": "Financial BPO"/);
  assert.match(script, /document\.querySelectorAll\('datalist\[data-translate-values\] option\[value\]'\)/);
  assert.match(script, /translateAttribute\(option, 'value', supportedLanguage\)/);
});

test('painel usa busca longa e o drawer mantém a marca acima do fundo escurecido', () => {
  assert.match(panelHtml, /<body class="dashboard-page">/);
  assert.match(panelHtml, /placeholder="Pesquisar"/);
  assert.match(styles, /\.dashboard-page \.topbar \.search\s*\{[\s\S]*flex:\s*1 1 auto/);
  assert.match(styles, /\.sidebar \.logo-text\s*\{[\s\S]*display:\s*flex/);
  assert.match(script, /app\.appendChild\(backdrop\)/);
  assert.doesNotMatch(script, /document\.body\.appendChild\(backdrop\)/);
});
