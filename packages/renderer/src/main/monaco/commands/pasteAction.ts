import { first } from 'lodash';
import * as monaco from 'monaco-editor';

async function readImage() {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    const type = item.types.find((type) => type.includes('image'));
    if (type) {
      return item.getType(type);
    }
  }
  return false;
}

async function saveAsset(editor: monaco.editor.ICodeEditor, blob: Blob) {
  const uri = editor.getModel()?.uri.toString();
  if (!uri) {
    return;
  }
  const [, type = ''] = blob.type.split('/');
  const ext = first(type.split('+'));
  const filename = Date.now() + '.' + ext;
  const url = new URL(uri);
  const dir = url.pathname.slice(0, url.pathname.lastIndexOf('/'));
  url.pathname = dir + '/assets/' + filename;
  const buf = await blob.arrayBuffer();
  const assetUri = url.toString();
  try {
    await window.fileService.writeFile(
      assetUri,
      new Int8Array(buf) as unknown as Buffer,
    );
  } catch (err) {
    return;
  }
  return 'assets/' + filename;
}

function insertImage(editor: monaco.editor.ICodeEditor, filePath: string) {
  const selection = editor.getSelection();
  if (!selection) {
    return;
  }
  const start = selection.getStartPosition();
  const end = selection.getEndPosition();
  const range = new monaco.Range(
    start.lineNumber,
    start.column,
    end.lineNumber,
    end.column,
  );
  editor.executeEdits(null, [
    { range, text: `![](${filePath})`, forceMoveMarkers: true },
  ]);
}

// 覆盖默认粘贴行为
monaco.editor.registerCommand(
  'editor.action.clipboardPasteAction',
  async () => {
    const editor = monaco.editor
      .getEditors()
      .find((editor) => editor.hasWidgetFocus());
    if (editor && editor.getModel()?.getLanguageId() === 'markdown') {
      const blob = await readImage();
      if (blob) {
        const relativePath = await saveAsset(editor, blob);
        if (relativePath) {
          insertImage(editor, relativePath);
          return;
        }
      }
    }
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText !== '') {
      editor?.trigger('keyboard', 'paste' /* Handler.Paste */, {
        text: clipboardText,
        pasteOnNewLine: false,
        multicursorText: false,
        mode: null,
      });
    }
  },
);
