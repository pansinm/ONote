import type * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { createEditor } from '../../../monaco';

/**
 * 创建editor实例
 * @returns
 */
function useEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  useEffect(() => {
    const editor = createEditor(containerRef.current!);
    setEditor(editor);
    return () => {
      editor.dispose();
    };
  }, []);
  return {
    editor,
    containerRef,
  };
}

export default useEditor;
