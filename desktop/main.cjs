const { app, BrowserWindow, ipcMain, net, protocol, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_SCHEME = 'hcp-app';
const AUTH_SCHEME = 'com.hcp.oportunidades';
const APP_ORIGIN = `${APP_SCHEME}://app`;
const WEB_ROOT = path.join(__dirname, 'www');
const LOGIN_URL = `${APP_ORIGIN}/html/login.html`;

let mainWindow = null;
let pendingAuthUrl = '';

function isTrustedAuthUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === `${AUTH_SCHEME}:`
      && url.hostname === 'auth'
      && url.pathname === '/callback';
  } catch {
    return false;
  }
}

function authUrlFromArguments(args) {
  return args.find((value) => isTrustedAuthUrl(value)) || '';
}

function isSafeExternalUrl(rawUrl) {
  try {
    return ['http:', 'https:'].includes(new URL(rawUrl).protocol);
  } catch {
    return false;
  }
}

function resolveWebFile(requestUrl) {
  const url = new URL(requestUrl);
  if (url.hostname !== 'app') return null;

  const decodedPath = decodeURIComponent(url.pathname === '/' ? '/html/login.html' : url.pathname);
  const relativePath = decodedPath.replace(/^[/\\]+/, '');
  const candidate = path.resolve(WEB_ROOT, relativePath);
  const relation = path.relative(WEB_ROOT, candidate);
  if (!relation || (!relation.startsWith('..') && !path.isAbsolute(relation))) return candidate;
  return null;
}

function registerLocalProtocol() {
  protocol.handle(APP_SCHEME, (request) => {
    const filePath = resolveWebFile(request.url);
    if (!filePath) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function deliverAuthUrl(rawUrl) {
  if (!isTrustedAuthUrl(rawUrl)) return;

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('hcp:auth-url', rawUrl);
    return;
  }

  pendingAuthUrl = rawUrl;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#030409',
    icon: path.join(WEB_ROOT, 'imgs', 'logo.png'),
    title: 'HCP',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(APP_ORIGIN)) return;
    event.preventDefault();
    if (isSafeExternalUrl(url)) shell.openExternal(url);
  });

  mainWindow.loadURL(LOGIN_URL);
}

function registerAuthProtocol() {
  if (app.isPackaged) {
    app.setAsDefaultProtocolClient(AUTH_SCHEME);
    return;
  }

  app.setAsDefaultProtocolClient(AUTH_SCHEME, process.execPath, [path.resolve(process.argv[1])]);
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

if (require('electron-squirrel-startup')) {
  app.quit();
} else {
  const hasSingleInstanceLock = app.requestSingleInstanceLock();
  if (!hasSingleInstanceLock) {
    app.quit();
  } else {
    app.on('second-instance', (_event, commandLine) => {
      const authUrl = authUrlFromArguments(commandLine);
      if (authUrl) deliverAuthUrl(authUrl);
      else if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });

    app.on('open-url', (event, url) => {
      event.preventDefault();
      deliverAuthUrl(url);
    });

    app.whenReady().then(() => {
      app.setAppUserModelId('com.squirrel.HCP.HCP');
      registerLocalProtocol();
      registerAuthProtocol();

      const firstAuthUrl = authUrlFromArguments(process.argv);
      if (firstAuthUrl) pendingAuthUrl = firstAuthUrl;

      ipcMain.handle('hcp:get-launch-auth-url', () => {
        const launchUrl = pendingAuthUrl;
        pendingAuthUrl = '';
        return launchUrl;
      });

      ipcMain.handle('hcp:open-external', async (_event, url) => {
        if (!isSafeExternalUrl(url)) throw new Error('URL externa não permitida.');
        await shell.openExternal(url);
        return true;
      });

      app.on('web-contents-created', (_event, contents) => {
        contents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
      });

      createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });
  }
}

module.exports = {
  authUrlFromArguments,
  isSafeExternalUrl,
  isTrustedAuthUrl,
  resolveWebFile
};
