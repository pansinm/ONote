import * as monaco from 'monaco-editor';

monaco.editor.registerCommand('onote.command.insertDate', function () {
  const editor = monaco.editor
    .getEditors()
    .find((editor) => editor.hasTextFocus());
  const selection = editor?.getSelection();
  if (selection) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      selection;
    editor?.executeEdits('insert-date', [
      {
        range: new monaco.Range(
          startLineNumber,
          startColumn,
          endLineNumber,
          endColumn,
        ),
        text: new Date().toLocaleDateString(),
        forceMoveMarkers: true,
      },
    ]);
  }
});
