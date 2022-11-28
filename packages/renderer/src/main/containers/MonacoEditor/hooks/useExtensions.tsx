import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { monacoExtensionManager } from '/@/main/frame';

function useExtensions(editor?: monaco.editor.IStandaloneCodeEditor) {
  useEffect(() => {
    if (editor) {
      monacoExtensionManager.activeAll(editor);
    }
    return () => {
      monacoExtensionManager.disposeAll();
    };
  }, [editor]);
}

export default useExtensions;
