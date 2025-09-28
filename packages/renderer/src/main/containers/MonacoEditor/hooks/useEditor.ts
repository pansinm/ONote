import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import {
  EDITOR_FONT_FAMILY,
  EDITOR_FONT_SIZE,
  EDITOR_WORD_WRAP,
} from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';
import _ from 'lodash';
import eventbus from '../../../eventbus/eventbus';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '/@/main/eventbus/EventName';

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
  const wordWrapConfig =
    stores.settingStore.settings[EDITOR_WORD_WRAP] || 'off';
  const wordWrap = wordWrapConfig as 'on' | 'off';
  const fontSize =
    (stores.settingStore.settings[EDITOR_FONT_SIZE] as number) || 14;

  useEffect(() => {
    editor?.updateOptions({ fontFamily: family, fontSize, wordWrap });
  }, [family, fontSize, wordWrap]);

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, {
      value: '',
      language: 'markdown',
      fixedOverflowWidgets: true,
      wordWrap: wordWrap,
      lineHeight: fontSize * 1.5,
      // theme: '',
      padding: {
        top: 10,
      },
      fontFamily: family,
      fontSize,
      scrollbar: {
        verticalScrollbarSize: 8,
      },
      unicodeHighlight: {
        ambiguousCharacters: false,
      },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
    });
    const selectionDisposer = editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection();
      if (selection) {
        const content = editor.getModel()?.getValueInRange(selection);
        eventbus.emit(EDITOR_SELECTION_CHANGED, {
          uri: editor.getModel()?.uri.toString(),
          content: editor.getValue(),
          selection: content || '',
        });
      }
    });
    const modelChangeDisposer = editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      eventbus.emit(EDITOR_CONTENT_CHANGED, {
        uri: editor.getModel()?.uri.toString(),
        content,
      });
    });
    setEditor(editor);
    return () => {
      selectionDisposer.dispose();
      modelChangeDisposer.dispose();
      editor.dispose();
    };
  }, []);
  return {
    editor,
    containerRef,
  };
}

export default useEditor;
