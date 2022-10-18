import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import useEditorScrollPos from './usePreviewerRPC/useEditorScrollPos';

/**
 * 恢复前一次滚动位置
 * @param editor
 */
function useEditorScrollRecover(editor?: monaco.editor.IStandaloneCodeEditor) {
  const scrollRef = useEditorScrollPos(editor);
  useEffect(() => {
    const disposer = editor?.onDidChangeModel(({ newModelUrl }) => {
      if (!newModelUrl) {
        return;
      }
      editor?.setScrollTop(
        scrollRef.current[newModelUrl.toString()]?.scrollTop || 0,
      );
    });
    return () => {
      disposer?.dispose();
    };
  }, [editor]);
}

export default useEditorScrollRecover;
