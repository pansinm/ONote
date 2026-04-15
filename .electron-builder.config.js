if (process.env.APP_VERSION === undefined) {
  const now = new Date();
  process.env.APP_VERSION = require('./package.json').version;
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
    '!packages/cli/dist/**',
    {
      from: 'buildResources',
      to: 'buildResources',
      filter: ['icon.png', 'tray-icon.png', 'tray-icon@2x.png'],
    },
  ],
  extraResources: [
    {
      from: 'packages/cli/dist/onote-cli',
      to: 'bin/onote-cli',
    },
  ],
  extraMetadata: {
    version: process.env.APP_VERSION,
  },
  compression: 'maximum',
  afterPack: './scripts/afterPack.js',
  linux: {
    target: ['deb', 'rpm', 'AppImage'],
    category: 'Utility',
    icon: 'buildResources/icon.png',
    maintainer: 'pansinm <pansinm@foxmail.com>',
  },
  deb: {
    afterInstall: './scripts/linux-postinstall.sh',
  },
  rpm: {
    afterInstall: './scripts/linux-postinstall.sh',
  },
  mac: {
    icon: './buildResources/icon.icns',
    gatekeeperAssess: false,
    hardenedRuntime: true,
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
  },
  dmg: {
    writeUpdateInfo: false,
  },
  artifactName: 'ONote-${os}-${arch}-${version}.${ext}',
  win: {
    target: ['zip', 'nsis'],
    icon: './buildResources/icon.ico',
  },
  nsis: {
    perMachine: false,
    include: './scripts/nsis-installer.nsh',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};

module.exports = config;
