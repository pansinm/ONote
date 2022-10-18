import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import previewerService from '/@/main/services/previewerService';
import stores from '/@/main/stores';

export default function useModelContentChange(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  useEffect(() => {
    const contentChangeDisposer = editor?.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      if (e.versionId && model) {
        stores.fileStore.markFileState(model.uri.toString(), 'changed');
      }
    });
    return () => {
      contentChangeDisposer?.dispose();
    };
  }, [editor]);
}
