import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import stores from '/@/main/stores';

export default function useModelContentChange(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  useEffect(() => {
    const contentChangeDisposer = editor?.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      if (e.versionId && model) {
        const uri = model.uri.toString();
        stores.fileStore.markFileState(uri, 'changed');
        // Agent 有 pending changes 时不触发自动保存，等用户 Accept 后统一存
        if (stores.pendingChangeStore?.hasPendingForUri(uri)) {
          return;
        }
        stores.fileStore.saveLater(uri);
      }
    });
    return () => {
      contentChangeDisposer?.dispose();
    };
  }, [editor]);
}
