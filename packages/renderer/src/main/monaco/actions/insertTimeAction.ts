import type * as monaco from 'monaco-editor';
import { getCurrentRange } from '../utils';

const insertTimeAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.insertTime',
  label: '插入时间',
  run: function (
    editor: monaco.editor.ICodeEditor,
    ...args: any[]
  ): void | Promise<void> {
    editor.focus();
    (editor as any)._commandService.executeCommand(
      'onote.command.insertTime',
      editor.getModel(),
      getCurrentRange(editor),
    );
  },
};

export default insertTimeAction;
