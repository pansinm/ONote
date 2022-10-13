import type * as monaco from 'monaco-editor';
import { getCurrentRange } from '../utils';

const insertDateAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.insertDate',
  label: '插入日期',
  // precondition: 'insert date',
  run: function (
    editor: monaco.editor.ICodeEditor,
    ...args: any[]
  ): void | Promise<void> {
    editor.focus();
    (editor as any)._commandService.executeCommand(
      'onote.command.insertDate',
      editor.getModel(),
      getCurrentRange(editor),
    );
  },
};

export default insertDateAction;
