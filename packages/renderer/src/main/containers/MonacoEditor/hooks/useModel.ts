import { useCallback, useEffect } from 'react';
import { useLatest } from 'react-use';
import type * as monaco from 'monaco-editor';
import stores from '/@/main/stores';
import { isMarkdown, isPlaintext } from '../../../../common/utils/uri';
import { filePanelManager } from '/@/main/mainFrame';

export default function useModel(
  editor: monaco.editor.IStandaloneCodeEditor | undefined,
  uri: string,
) {
  const latestUri = useLatest(uri);
  const loadModel = useCallback(
    async (uri: string) => {
      const panel = filePanelManager.getPanel(uri);
      if (!panel?.editable) {
        return;
      }
      const model = await stores.fileStore.getOrCreateModel(uri);
      if (model.uri.toString() === latestUri.current) {
        editor?.setModel(model);
        editor?.focus();
      }
    },
    [editor],
  );

  useEffect(() => {
    if (editor) {
      loadModel(latestUri.current);
    }
  }, [editor]);

  useEffect(() => {
    if (uri && (isMarkdown(uri) || isPlaintext(uri))) {
      loadModel(uri);
    }
  }, [uri]);
}
