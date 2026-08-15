const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hcpDesktop', Object.freeze({
  isDesktopApp: true,
  platform: process.platform,
  getLaunchUrl: () => ipcRenderer.invoke('hcp:get-launch-auth-url'),
  openExternal: (url) => ipcRenderer.invoke('hcp:open-external', url),
  onAuthUrl: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, url) => callback(url);
    ipcRenderer.on('hcp:auth-url', listener);
    return () => ipcRenderer.removeListener('hcp:auth-url', listener);
  }
}));
