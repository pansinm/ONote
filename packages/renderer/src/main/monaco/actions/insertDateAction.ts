import type * as monaco from 'monaco-editor';

const insertDateAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.insertDate',
  label: '插入日期',
  // precondition: 'insert date',
  run: function (
    editor: monaco.editor.ICodeEditor,
    ...args: any[]
  ): void | Promise<void> {
    editor.focus();
    (editor as any)._commandService.executeCommand('onote.command.insertDate');
  },
};

export default insertDateAction;
