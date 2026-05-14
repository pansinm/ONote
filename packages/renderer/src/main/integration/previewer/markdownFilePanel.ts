import { filePanelManager } from '../../frame';

filePanelManager.registerFilePanel({
  extensions: ['.md', '.mdx'],
  languageId: 'markdown-math',
  previewer: './previewer.html',
  editable: true,
});
