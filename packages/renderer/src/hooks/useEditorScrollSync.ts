import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import Client from '../rpc/Client';
import EditorRPC from '../rpc/EditorRPC';
import mainServer from '../rpc/mainServer';
import PreviewerRPC from '../rpc/PreviewerRPC';

export default function useEditorScrollSync(
  editor: monaco.editor.IStandaloneCodeEditor | undefined,
  previewerWindow: Window | undefined,
) {
  const scrollLineRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!editor || !previewerWindow) {
      return;
    }

    const previewerClient = new Client(previewerWindow);
    const bindScrollEvent = () => {
      return editor.onDidScrollChange((e) => {
        const [range] = editor.getVisibleRanges();
        if (range) {
          const startLineNumber = range.startLineNumber;
          const uri = editor.getModel()?.uri.toString() || '';
          previewerClient.call(PreviewerRPC.ScrollToLine, uri, startLineNumber);
          scrollLineRef.current[uri] = startLineNumber;
        }
      });
    };

    let editorScroll = bindScrollEvent();
    let timeout: any;

    const scrollFromPreviewer = mainServer.handle(
      EditorRPC.ScrollToLine,
      async (lineNumber: number) => {
        editorScroll.dispose();
        const uri = editor.getModel()?.uri.toString() || '';
        scrollLineRef.current[uri] = lineNumber;
        editor.setScrollTop(editor.getTopForLineNumber(lineNumber));
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          editorScroll && editorScroll.dispose();
          editorScroll = bindScrollEvent();
        }, 300);
      },
    );

    const getEditorScrollLine = mainServer.handle(
      EditorRPC.GetScrollLine,
      async (uri: string) => {
        return scrollLineRef.current[uri];
      },
    );

    return () => {
      scrollFromPreviewer.dispose();
      editorScroll.dispose();
      getEditorScrollLine.dispose();
    };
  }, [editor, previewerWindow]);
}
