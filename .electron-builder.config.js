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
    target: ['AppImage'],
    category: 'Utility',
  },
};

module.exports = config;
