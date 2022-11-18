import { filePanelManager } from '../frame';

filePanelManager.registerFilePanel({
  extensions: ['.gitignore', '.lock', '.json', '.txt'],
  editable: true,
  languageId: 'plaintext',
  previewer: './previewer.html',
});
