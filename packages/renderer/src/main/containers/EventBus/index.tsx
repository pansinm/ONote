import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import eventbus from '../../eventbus';
import stores from '../../stores';
import { EDITOR_FILE_SAVE } from '../../eventbus/EventName';
import { fileType, relative } from '/@/common/utils/uri';
import { getFileName } from '@sinm/react-file-tree/lib/utils';
import { html2md } from '/@/common/markdown';

const EventBus = () => {
  useEffect(() => {
    const handler = (uri: string) => {
      stores.fileStore.save(uri);
    };
    eventbus.on(EDITOR_FILE_SAVE, handler);
    return () => {
      eventbus.off(EDITOR_FILE_SAVE, handler);
    };
  }, []);
  useEffect(() => {
    const handleMessage = (event: any) => {
      const data = event?.data;
      if (data?.type === 'open-file') {
        stores.activationStore.activeFile(
          event?.data.url.replace(/^onote:/, 'file:'),
        );
        return;
      }
      if (data?.type === 'insert-file') {
        const { payload } = data;
        const { insertUri } = payload || {};
        const editor = monaco.editor.getEditors()[0];
        const model = editor.getModel();
        const modelUri = model?.uri.toString();
        const position = editor?.getPosition();
        if (editor && modelUri && position) {
          const relativePath = relative(modelUri, insertUri);
          editor.executeEdits('', [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column,
              ),
              text:
                fileType(insertUri) === 'image'
                  ? `![](${relativePath})`
                  : `[${getFileName(insertUri)}](${relativePath})`,
            },
          ]);
        }
      }

      if (data?.type === 'ChatMessage') {
        const { content } = data;
        const editor = monaco.editor.getEditors()[0];
        const model = editor.getModel();
        const modelUri = model?.uri.toString();
        const position = editor?.getPosition();
        if (editor && modelUri && position) {
          editor.executeEdits('', [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column,
              ),
              text: html2md(content),
            },
          ]);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  return null;
};

export default EventBus;
