import type * as monaco from 'monaco-editor';
import { getCurrentRange } from '../utils';
import i18next from '../../i18n';

const insertDateAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.insertDate',
  get label() {
    return i18next.t('common:insertDate');
  },
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
