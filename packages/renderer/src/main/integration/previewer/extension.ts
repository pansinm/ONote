import mainFrame from '../../frame/mainFrame';
import * as monaco from 'monaco-editor';
import IPCMethod from '/@/common/ipc/IPCMethod';
import stores from '../../stores';
import state from './state';
import eventbus from '../../eventbus/eventbus';
import { FILE_CONTENT_CHANGED } from '../../eventbus/EventName';

function broadcastToPreviewer(channel: string, payload: any) {
  mainFrame
    .findTunnels((tunnel) => tunnel.groupId === 'previewer')
    .forEach((tunnel) => {
      tunnel.send(channel, payload);
    });
}

eventbus.on(FILE_CONTENT_CHANGED, ({ uri }) => {
  broadcastToPreviewer(FILE_CONTENT_CHANGED, { uri });
});

mainFrame.registerEditorExtension({
  active(editor: monaco.editor.IStandaloneCodeEditor) {
    const modelChangeDisposer = editor.onDidChangeModel((e) => {
      if (e.newModelUrl) {
        const model = monaco.editor.getModel(e.newModelUrl);
        const uri = model?.uri.toString() || '';
        broadcastToPreviewer(IPCMethod.OpenedModelChangedEvent, {
          uri,
          content: model?.getValue() || '',
          rootDirUri: stores.activationStore.rootUri,
          // lineNumber: scrollCtx.current?.[uri]?.lineNumber,
        });
      }
    });

    const contentChangeDisposer = editor.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      broadcastToPreviewer(IPCMethod.OpenedModelChangedEvent, {
        uri: model?.uri.toString() || '',
        content: model?.getValue() || '',
        rootDirUri: stores.activationStore.rootUri,
      });
    });

    const scrollDisposer = editor?.onDidScrollChange((e) => {
      if (state.PREVIEWER_SCROLLING) {
        return;
      }
      broadcastToPreviewer(IPCMethod.EditorScrollChangedEvent, {
        uri: editor.getModel()?.uri.toString() || '',
        lineNumber: editor.getVisibleRanges()[0].startLineNumber,
      });
    });

    return {
      dispose() {
        modelChangeDisposer.dispose();
        contentChangeDisposer.dispose();
        scrollDisposer.dispose();
      },
    };
  },
});
