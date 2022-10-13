import * as monaco from 'monaco-editor';

monaco.editor.registerCommand(
  'onote.command.insertDate',
  function (accessor, model: monaco.editor.ITextModel, range: monaco.Range) {
    if (!range || !model) {
      return;
    }
    model?.applyEdits([
      {
        range: range,
        text: new Date().toLocaleDateString(),
        forceMoveMarkers: true,
      },
    ]);
  },
);
