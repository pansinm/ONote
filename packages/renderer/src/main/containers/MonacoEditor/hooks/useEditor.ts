import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { EDITOR_FONT_FAMILY } from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';

/**
 * 创建editor实例
 * @returns
 */
function useEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const family =
    (stores.settingStore.settings[EDITOR_FONT_FAMILY] as string) ||
    'Source Han Sans, Noto, Droid Sans Mono, monospace, Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, WenQuanYi Micro Hei, Arial, sans-serif';

  // update font family
  useEffect(() => {
    editor?.updateOptions({ fontFamily: family });
  }, [family]);

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, {
      value: '',
      language: 'markdown',
      fixedOverflowWidgets: true,
      // wordWrap: 'on',
      // theme: '',
      padding: {
        top: 10,
      },
      fontFamily: family,
      scrollbar: {
        verticalScrollbarSize: 8,
      },
      unicodeHighlight: {
        ambiguousCharacters: false,
      },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
    });
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
