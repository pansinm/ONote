import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import QuickInsertCompletionItemProvider from './QuickInsertCompletionProvider';

// 用于调试
(window as any).monaco = monaco;

(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

monaco.languages.getLanguages().forEach((lan) => {
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new QuickInsertCompletionItemProvider(),
  );
});

monaco.editor.registerCommand('onote.command.insertDate', function () {
  const editor = monaco.editor
    .getEditors()
    .find((editor) => editor.hasTextFocus());
  const selection = editor?.getSelection();
  if (selection) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      selection;
    editor?.executeEdits('insert-date', [
      {
        range: new monaco.Range(
          startLineNumber,
          startColumn,
          endLineNumber,
          endColumn,
        ),
        text: new Date().toLocaleDateString(),
        forceMoveMarkers: true,
      },
    ]);
  }
});

