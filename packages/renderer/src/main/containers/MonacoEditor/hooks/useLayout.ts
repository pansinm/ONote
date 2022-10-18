import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import useDimensions from '/@/hooks/useDimensions';

function useLayout(
  editor: monaco.editor.IStandaloneCodeEditor | undefined,
  container: HTMLDivElement | null,
) {
  const [setNode, rect] = useDimensions();
  useEffect(() => {
    setNode(container);
  }, [editor, container]);

  useEffect(() => {
    editor?.layout();
  }, [rect]);
}

export default useLayout;
