import * as monaco from 'monaco-editor';
import { applyModelEdits, toggleTask } from '../utils';

const toggleTaskItemAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.toggleTaskListAction',
  label: '切换任务完成状态',
  // precondition: 'insert date',
  keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyD],
  run: function (
    editor: monaco.editor.ICodeEditor,
    ...args: any[]
  ): void | Promise<void> {
    editor.focus();

    const model = editor.getModel();
    const pos = editor.getPosition();
    if (model && pos) {
      const line = model.getLineContent(pos.lineNumber);
      applyModelEdits(model, [
        {
          text: toggleTask(line),
          range: new monaco.Range(
            pos.lineNumber,
            0,
            pos.lineNumber,
            model.getLineMaxColumn(pos.lineNumber),
          ),
        },
      ]);
    }
  },
};

export default toggleTaskItemAction;
