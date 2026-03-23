import type * as monaco from 'monaco-editor';
import { getCurrentRange } from '../utils';
import i18next from '../../i18n';

const insertTimeAction: monaco.editor.IActionDescriptor = {
  id: 'onote.action.insertTime',
  get label() {
    return i18next.t('common:insertTime');
  },
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
