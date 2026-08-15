const path = require('node:path');

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'HCP',
    icon: path.join(__dirname, 'assets', 'hcp.ico'),
    ignore: [
      /^\/out(?:\/|$)/,
      /^\/releases(?:\/|$)/
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'HCP',
        setupExe: 'HCP-Setup.exe',
        setupIcon: path.join(__dirname, 'assets', 'hcp.ico'),
        noMsi: true
      }
    }
  ]
};
