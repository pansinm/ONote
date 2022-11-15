import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import IPCMethod from '/@/common/ipc/IPCMethod';
import { portsServer } from '/@/main/ipc';

function useEditorScrollSync(editor?: monaco.editor.IStandaloneCodeEditor) {
  const scrollTimeout = useRef();
  const previewerScrollingRef = useRef(false);
  useEffect(() => {
    const handlePreviewerScrollChanged = (
      _: unknown,
      {
        uri,
        lineNumber,
      }: {
        uri: string;
        lineNumber: number;
        inIframe: boolean;
      },
    ) => {
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

    const disposePreviewerScrollEvent = portsServer.listenEvent(
      IPCMethod.PreviewerScrollChangedEvent,
      handlePreviewerScrollChanged,
    );

    const scrollDisposer = editor?.onDidScrollChange((e) => {
      if (!previewerScrollingRef.current) {
        portsServer.broadEvent(IPCMethod.EditorScrollChangedEvent, {
          uri: editor.getModel()?.uri.toString() || '',
          lineNumber: editor.getVisibleRanges()[0].startLineNumber,
        });
      }
    });

    return () => {
      disposePreviewerScrollEvent();
      scrollDisposer?.dispose();
    };
  }, [editor]);
}

export default useEditorScrollSync;
