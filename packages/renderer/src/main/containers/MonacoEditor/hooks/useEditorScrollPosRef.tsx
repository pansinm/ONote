import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';

/**
 * 编辑器滚动条位置
 * @param editor
 * @returns
 */
export default function useEditorScrollPos(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  const scrollRef = useRef<
    Record<string, { scrollTop: number; lineNumber: number }>
  >({});
  useEffect(() => {
    const disposer = editor?.onDidScrollChange((e) => {
      const uri = editor.getModel()?.uri.toString() || '';
      scrollRef.current[uri] = {
        scrollTop: e.scrollTop,
        lineNumber: editor?.getVisibleRanges()?.[0].startLineNumber || 0,
      };
      console.log(scrollRef.current);
    });
    return () => {
      disposer?.dispose();
    };
  }, [editor]);
  return scrollRef;
}
