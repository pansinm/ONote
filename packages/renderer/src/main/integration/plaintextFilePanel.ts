import { filePanelManager } from '../frame';

filePanelManager.registerFilePanel({
  extensions: [
    '.gitignore',
    '.lock',
    '.json',
    '.txt',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.log',
    '.html',
  ],
  editable: true,
  languageId: 'plaintext',
  previewer: undefined,
});

filePanelManager.registerFilePanel({
  extensions: ['.typ'],
  editable: true,
  languageId: 'plaintext',
  previewer: './previewer.html',
});
