import type * as monaco from 'monaco-editor';
import * as actions from './actions';

export function registerActions(editor: monaco.editor.IStandaloneCodeEditor) {
  Object.values(actions).forEach((action) => {
    editor.addAction(action);
  });
}
