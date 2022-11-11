import * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { useScrollPosContext } from '../ScrollPosContext';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type { IPCEditorModelChangedEvent } from '/@/common/ipc/types';
import { portsServer } from '/@/main/ipc';
import stores from '/@/main/stores';

export default function useOnModelChange(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  const scrollCtx = useScrollPosContext();
  useEffect(() => {
    const modelChangeDisposer = editor?.onDidChangeModel((e) => {
      if (e.newModelUrl) {
        const model = monaco.editor.getModel(e.newModelUrl);
        const uri = model?.uri.toString() || '';
        portsServer.broadEvent(IPCMethod.EditorModelChanged, {
          uri,
          content: model?.getValue() || '',
          rootDirUri: stores.activationStore.rootUri,
          lineNumber: scrollCtx.current?.[uri].lineNumber,
        } as IPCEditorModelChangedEvent['payload']);
      }
    });
    const contentChangeDisposer = editor?.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      portsServer.broadEvent(IPCMethod.EditorModelChanged, {
        uri: model?.uri.toString() || '',
        content: model?.getValue() || '',
        rootDirUri: stores.activationStore.rootUri,
      } as IPCEditorModelChangedEvent['payload']);
    });
    return () => {
      modelChangeDisposer?.dispose();
      contentChangeDisposer?.dispose();
    };
  }, [editor]);
}
