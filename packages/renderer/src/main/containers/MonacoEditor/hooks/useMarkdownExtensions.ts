import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { activate } from '/@/main/monaco';
import { MonacoMarkdownExtension } from '/@/simmer-markdown/src/ts';

function useMarkdownExtensions(editor?: monaco.editor.IStandaloneCodeEditor) {
  useEffect(() => {
    if (editor) {
      new MonacoMarkdownExtension().activate(editor);
      activate(editor);
    }
  }, [editor]);
}

export default useMarkdownExtensions;
