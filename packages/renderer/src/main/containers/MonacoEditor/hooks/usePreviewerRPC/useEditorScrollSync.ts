import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import previewerService from '/@/main/services/previewerService';

function useEditorScrollSync(editor?: monaco.editor.IStandaloneCodeEditor) {
  const scrollTimeout = useRef();
  const previewerScrollingRef = useRef(false);
  useEffect(() => {
    const handlePreviewerScrollChanged = ({
      uri,
      lineNumber,
    }: {
      uri: string;
      lineNumber: number;
    }) => {
      if (uri !== editor?.getModel()?.uri.toString()) {
        return;
      }
      clearTimeout(scrollTimeout.current);
      previewerScrollingRef.current = true;
      editor?.setScrollTop(editor?.getTopForLineNumber(lineNumber));
      setTimeout(() => {
        previewerScrollingRef.current = false;
      });
    };

    previewerService.on(
      'previewer.scroll.changed',
      handlePreviewerScrollChanged,
    );

    const scrollDisposer = editor?.onDidScrollChange((e) => {
      if (!previewerScrollingRef.current) {
        previewerService.send('main.scroll.changed', {
          uri: editor.getModel()?.uri.toString() || '',
          lineNumber: editor.getVisibleRanges()[0].startLineNumber,
        });
      }
    });

    return () => {
      previewerService.off(
        'previewer.scroll.changed',
        handlePreviewerScrollChanged,
      );
      scrollDisposer?.dispose();
    };
  }, [editor]);
}

export default useEditorScrollSync;