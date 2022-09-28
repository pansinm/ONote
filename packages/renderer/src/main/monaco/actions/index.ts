import type * as monaco from 'monaco-editor';
import insertDateAction from './insertDateAction';

export function registerActions(editor: monaco.editor.IStandaloneCodeEditor) {
  editor.addAction(insertDateAction);
}
