const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');

const root = resolve(__dirname, '..');
const packageConfig = JSON.parse(readFileSync(resolve(root, 'desktop/package.json'), 'utf8'));
const forgeConfig = readFileSync(resolve(root, 'desktop/forge.config.cjs'), 'utf8');
const mainSource = readFileSync(resolve(root, 'desktop/main.cjs'), 'utf8');
const preloadSource = readFileSync(resolve(root, 'desktop/preload.cjs'), 'utf8');

test('aplicativo de Windows gera instalador Squirrel com versões fixadas', () => {
  assert.equal(packageConfig.productName, 'HCP');
  assert.match(packageConfig.scripts.installer, /electron-forge make/);
  assert.equal(packageConfig.devDependencies.electron, '43.4.0');
  assert.equal(packageConfig.devDependencies['@electron-forge/maker-squirrel'], '7.11.2');
  assert.equal(packageConfig.overrides.tar, '7.5.22');
  assert.equal(packageConfig.overrides.tmp, '0.2.7');
  assert.match(forgeConfig, /HCP-Setup\.exe/);
  assert.match(forgeConfig, /maker-squirrel/);
});

test('janela desktop mantém isolamento e não expõe Node ao site', () => {
  assert.match(mainSource, /contextIsolation:\s*true/);
  assert.match(mainSource, /nodeIntegration:\s*false/);
  assert.match(mainSource, /sandbox:\s*true/);
  assert.match(mainSource, /webSecurity:\s*true/);
  assert.match(preloadSource, /contextBridge\.exposeInMainWorld\('hcpDesktop'/);
  assert.doesNotMatch(preloadSource, /ipcRenderer\.send\s*[,)]/);
});

test('links e callbacks do aplicativo são validados antes de abrir ou encaminhar', () => {
  assert.match(mainSource, /\['http:', 'https:'\]\.includes/);
  assert.match(mainSource, /AUTH_SCHEME = 'com\.hcp\.oportunidades'/);
  assert.match(mainSource, /url\.hostname === 'auth'/);
  assert.match(mainSource, /url\.pathname === '\/callback'/);
  assert.match(mainSource, /setPermissionRequestHandler/);
});
