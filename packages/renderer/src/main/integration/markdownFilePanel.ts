import { filePanelManager } from '../frame';

filePanelManager.registerFilePanel({
  extensions: ['.md', '.mdx'],
  languageId: 'markdown',
  previewer: './previewer.html',
  editable: true,
});
