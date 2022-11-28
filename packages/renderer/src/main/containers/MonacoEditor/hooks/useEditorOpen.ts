import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import stores from '/@/main/stores';

function useEditorOpen(editor?: monaco.editor.IStandaloneCodeEditor) {
  useEffect(() => {
    if (editor) {
      (editor as any)._codeEditorService.doOpenEditor = function (
        e: monaco.editor.IStandaloneCodeEditor,
        param: any,
      ) {
        const uri = param.resource.toString();
        if (/^file:/.test(uri)) {
          stores.activationStore.activeFile(uri);
        } else {
          window.open(uri);
        }
      };
    }
  }, [editor]);
}

export default useEditorOpen;
