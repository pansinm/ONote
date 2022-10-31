import * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import previewerService from '/@/main/services/previewerService';
import stores from '/@/main/stores';

export default function useOnModelChange(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  useEffect(() => {
    const modelChangeDisposer = editor?.onDidChangeModel((e) => {
      if (e.newModelUrl) {
        const model = monaco.editor.getModel(e.newModelUrl);
        previewerService.send('main.editor.modelChanged', {
          uri: model?.uri.toString() || '',
          content: model?.getValue() || '',
          rootDirUri: stores.activationStore.rootUri,
        });
      }
    });
    const contentChangeDisposer = editor?.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      previewerService.send('main.editor.contentChanged', {
        uri: model?.uri.toString() || '',
        content: model?.getValue() || '',
        rootDirUri: stores.activationStore.rootUri,
      });
    });
    return () => {
      modelChangeDisposer?.dispose();
      contentChangeDisposer?.dispose();
    };
  }, [editor]);
}
