import * as monaco from 'monaco-editor';
import stores from '../stores';
import portsServer from './portsServer';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type { IPCGetEditorModelResponse } from '/@/common/ipc/types';

portsServer.handle(IPCMethod.GetEditorModel, async () => {
  const uri = stores.activationStore.activeFileUri;
  if (!uri) {
    throw new Error('No file opened');
  }
  return {
    uri: stores.activationStore.activeFileUri,
    content: monaco.editor.getModel(monaco.Uri.parse(uri))?.getValue(),
    rootDirUri: stores.activationStore.rootUri,
  } as IPCGetEditorModelResponse['payload'];
});
