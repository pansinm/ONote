import type * as monaco from 'monaco-editor';
import * as actions from './actions';
import { bindingKeys } from './keybindings';

function registerActions(editor: monaco.editor.IStandaloneCodeEditor) {
  Object.values(actions).forEach((action) => {
    editor.addAction(action);
  });
}

export function activate(editor: monaco.editor.IStandaloneCodeEditor) {
  registerActions(editor);
  bindingKeys(editor);
}
