import * as monaco from 'monaco-editor';

export function getCurrentRange(editor: monaco.editor.ICodeEditor) {
  const selection = editor?.getSelection();
  if (selection) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      selection;
    return new monaco.Range(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
    );
  }
  return undefined;
}
