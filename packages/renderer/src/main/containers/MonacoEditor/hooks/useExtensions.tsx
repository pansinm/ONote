import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { monacoExtensionManager } from '/@/main/frame';

function useExtensions(editor?: monaco.editor.IStandaloneCodeEditor) {
  useEffect(() => {
    let disposer: monaco.IDisposable;
    if (editor) {
      disposer = monacoExtensionManager.activeAll(editor);
    }
    return () => {
      disposer?.dispose();
    };
  }, [editor]);
}

export default useExtensions;
