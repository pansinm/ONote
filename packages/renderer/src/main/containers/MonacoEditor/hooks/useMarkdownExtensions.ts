import * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { activate } from '/@/main/monaco';
import { MonacoMarkdownExtension } from '/@/simmer-markdown/src/ts';

function useMarkdownExtensions(editor?: monaco.editor.IStandaloneCodeEditor) {
  useEffect(() => {
    if (editor) {
      new MonacoMarkdownExtension().activate(editor);
      activate(editor);
      editor.onKeyDown((e) => {
        console.log(e);
        if (e.code === 'Quote' && e.shiftKey) {
          const selection = editor.getSelection();
          if (selection) {
            e.preventDefault();
            const range = new monaco.Range(
              selection?.startLineNumber,
              selection?.startColumn,
              selection?.endLineNumber,
              selection?.endColumn,
            );
            editor.executeEdits(
              null,
              [{ range: range, text: e.shiftKey ? '""' : '\'\'' }],
              [
                new monaco.Selection(
                  range.startLineNumber,
                  range.startColumn + 1,
                  range.startLineNumber,
                  range.startColumn + 1,
                ),
              ],
            );
          }
        }
      });
    }
  }, [editor]);
}

export default useMarkdownExtensions;
