import * as monaco from 'monaco-editor';
import { applyModelEdits } from '../utils';

monaco.editor.registerCommand(
  'onote.command.insertTime',
  function (accessor, model: monaco.editor.ITextModel, range: monaco.Range) {
    if (!range || !model) {
      return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    applyModelEdits(model, [
      {
        range: range,
        text: timeString,
        forceMoveMarkers: true,
      },
    ]);
  },
);
