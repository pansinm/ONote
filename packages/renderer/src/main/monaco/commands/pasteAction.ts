import { first } from 'lodash';
import * as monaco from 'monaco-editor';
import fileService from '../../services/fileService';
import manager from '../manager';
import clipboardService from '/@/common/services/clipboardService';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('PasteAction');

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
    await fileService.writeFile(
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
    {
      range,
      text: `${
        /\.(jpe?g|png|gif|svg|webp|bmp|ico)$/i.test(filePath) ? '!' : ''
      }[](${filePath})`,
      forceMoveMarkers: true,
    },
  ]);
}

// 覆盖默认粘贴行为
monaco.editor.registerCommand(
  'editor.action.clipboardPasteAction',
  async (accessor, uri) => {
    const editor = monaco.editor.getEditors()[0];
    const model = monaco.editor.getModel(uri);
    if (editor && model?.getLanguageId() === 'markdown') {
      try {
        const files = await window.simmer.readBlobsFromClipboard();
        for (const file of files) {
          const relativePath = await saveAsset(editor, file);
          if (relativePath) {
            insertImage(editor, relativePath);
          }
        }
        if (files.length) {
          return;
        }
      } catch (err) {
        // ignore
        logger.error('Failed to paste file', err);
      }
      const blob = await clipboardService.readImage();
      if (blob) {
        const relativePath = await saveAsset(editor, blob);
        if (relativePath) {
          insertImage(editor, relativePath);
          return;
        }
      }
    }
    const clipboardText = await clipboardService.readText();
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
