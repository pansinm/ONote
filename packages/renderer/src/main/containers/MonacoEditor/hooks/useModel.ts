import { useCallback, useEffect } from 'react';
import { useLatest } from 'react-use';
import type * as monaco from 'monaco-editor';
import stores from '/@/main/stores';
import { isMarkdown, isPlaintext } from '/@/utils/uri';

export default function useModel(
  editor: monaco.editor.IStandaloneCodeEditor | undefined,
  uri: string,
) {
  const latestUri = useLatest(uri);
  const loadModel = useCallback(
    async (uri: string) => {
      const model = await stores.fileStore.getOrCreateModel(uri);
      if (model.uri.toString() === latestUri.current) {
        editor?.setModel(model);
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
