import * as monaco from 'monaco-editor';
import { EDITOR_FILE_SAVE } from '../../eventbus/EventName';
import emitter from '../../eventbus';

export function bindingKeys(editor: monaco.editor.IStandaloneCodeEditor) {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    const model = editor.getModel();
    if (model) {
      emitter.emit(EDITOR_FILE_SAVE, model.uri.toString());
    }
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, function () {
    (editor as any)._commandService.executeCommand(
      'editor.action.clipboardPasteAction',
    );
  });
}
