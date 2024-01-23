if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date();
  process.env.VITE_APP_VERSION = require('./package.json').version;
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.pansinm.onote',
  productName: 'ONote',
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  files: [
    'packages/**/dist/**',
    {
      from: 'buildResources',
      to: 'buildResources',
    },
  ],
  extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },
  linux: {
    target: ['deb', 'rpm', 'AppImage'],
    category: 'Utility',
    icon: 'buildResources/icon.icns',
    maintainer: 'pansinm <pansinm@foxmail.com>',
  },
  mac: {
    icon: './buildResources/icon.icns',
    gatekeeperAssess: false,
    hardenedRuntime: true,
    target: ['dmg', 'zip'],
  },
  artifactName: 'ONote-${os}-${arch}-${version}.${ext}',
  win: {
    target: ['zip', 'nsis'],
    icon: './buildResources/icon.ico',
  },
  nsis: {
    perMachine: false,
  },
};

module.exports = config;
