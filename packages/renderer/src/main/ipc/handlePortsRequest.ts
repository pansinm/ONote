import * as monaco from 'monaco-editor';
import stores from '../stores';
import portsServer from './portsServer';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCGetEditorModelResponse,
  IPCGetEditorScrollPositionResponse,
} from '/@/common/ipc/types';

portsServer.handleRequest(IPCMethod.GetEditorModel, async () => {
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

portsServer.handleRequest(
  IPCMethod.GetEditorScrollPosition,
  async ({ uri }: { uri: string }) => {
    const editor = monaco.editor.getEditors()['0'];
    if (editor && editor.getModel()?.uri.toString() === uri) {
      return {
        uri,
        lineNumber: editor.getVisibleRanges()?.[0].startLineNumber || 0,
      } as IPCGetEditorScrollPositionResponse['payload'];
    } else {
      throw new Error('No file opened');
    }
  },
);
