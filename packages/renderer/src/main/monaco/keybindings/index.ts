import * as monaco from 'monaco-editor';
import { EDITOR_FILE_SAVE } from '../../eventbus/EventName';
import emitter from '../../eventbus';
import { getFenceContent, isInFence } from '../utils';

function forMindMap(
  lineTextBefore: string,
  editor: monaco.editor.IStandaloneCodeEditor,
  key: monaco.KeyCode,
  modifier?: monaco.KeyCode,
) {
  const head = lineTextBefore.match(/^\s*[+\-*]*\s*/);
  const selection = editor.getSelection();
  if (!head || !selection) {
    return false;
  }

  if (key === monaco.KeyCode.Enter) {
    editor.trigger(null, 'type', {
      source: 'keyboard',
      text: '\n' + head[0],
    });
    return true;
  }
  if (key === monaco.KeyCode.Tab) {
    const text = head[0].replace(
      /([-+*])/,
      modifier === monaco.KeyCode.Shift ? '' : '$1$1',
    );

    console.log(modifier === monaco.KeyCode.Shift);
    const range = new monaco.Range(
      selection.startLineNumber,
      0,
      selection.startLineNumber,
      head[0].length + 1,
    );
    editor.executeEdits(null, [
      {
        text,
        range,
      },
    ]);
    return true;
  }
  return false;
}

function onKeyPressed(
  editor: monaco.editor.IStandaloneCodeEditor,
  key: monaco.KeyCode,
  modifier?: monaco.KeyCode,
) {
  const selection = editor.getSelection()!;
  const model = editor.getModel()!;
  const startLine = model.getLineContent(selection?.startLineNumber);
  const inFence = isInFence(model, editor.getPosition()!);
  const DEFAULT_COMMAND = `markdown.extension.editing.on${
    monaco.KeyCode[modifier!] || ''
  }${monaco.KeyCode[key]}Key`;

  if (!inFence) {
    editor.trigger(null, DEFAULT_COMMAND, {});
    return;
  }

  const fenceContent = getFenceContent(model, editor.getPosition()!);
  if (fenceContent.includes('mindmap')) {
    const lineTextBefore = startLine?.slice(0, selection.startColumn);
    if (forMindMap(lineTextBefore, editor, key, modifier)) {
      return;
    }
  }
  editor.trigger(null, DEFAULT_COMMAND, {});
}

export function bindingKeys(editor: monaco.editor.IStandaloneCodeEditor) {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    const model = editor.getModel();
    if (model) {
      emitter.emit(EDITOR_FILE_SAVE, model.uri.toString());
    }
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, function () {
    if (editor.hasTextFocus()) {
      (editor as any)._commandService.executeCommand(
        'editor.action.clipboardPasteAction',
        editor.getModel()?.uri,
      );
    } else {
      document.execCommand('paste');
    }
  });

  (window as any).editor = editor;

  const editorContext =
    'editorTextFocus && !editorReadonly && !suggestWidgetVisible';
  editor.addCommand(
    monaco.KeyCode.Enter,
    onKeyPressed.bind(null, editor, monaco.KeyCode.Enter),
    editorContext,
  );

  editor.addCommand(
    monaco.KeyCode.Tab,
    onKeyPressed.bind(null, editor, monaco.KeyCode.Tab),
    editorContext,
  );

  editor.addCommand(
    monaco.KeyCode.Tab | monaco.KeyMod.Shift,
    onKeyPressed.bind(null, editor, monaco.KeyCode.Tab, monaco.KeyCode.Shift),
    editorContext,
  );
}
