import * as monaco from 'monaco-editor';
import { applyModelEdits } from '../utils';

monaco.editor.registerCommand(
  'onote.command.insertDate',
  function (accessor, model: monaco.editor.ITextModel, range: monaco.Range) {
    if (!range || !model) {
      return;
    }
    applyModelEdits(model, [
      {
        range: range,
        text: new Date().toLocaleDateString(),
        forceMoveMarkers: true,
      },
    ]);
  },
);
