import { filePanelManager } from '../mainFrame';

filePanelManager.registerFilePanel({
  extensions: ['.md', '.mdx'],
  languageId: 'markdown',
  previewer: './previewer.html',
  editable: true,
});
