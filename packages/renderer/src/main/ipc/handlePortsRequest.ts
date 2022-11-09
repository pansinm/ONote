import * as monaco from 'monaco-editor';
import stores from '../stores';
import portsServer from './portsServer';

portsServer.handle('/editor/model/current', async () => {
  const uri = stores.activationStore.activeFileUri;
  if (!uri) {
    throw new Error('No file opened');
  }
  return {
    uri: stores.activationStore.activeFileUri,
    content: monaco.editor.getModel(monaco.Uri.parse(uri)),
  };
});
