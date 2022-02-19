import * as monaco from 'monaco-editor';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useEffect } from 'react';
import useDimensions from '../hooks/useDimensions';
import { MonacoMarkdownExtension } from '../simmer-markdown/src/ts';

export type EditorRef = {
  getInstance: () => monaco.editor.IStandaloneCodeEditor | undefined;
};
export default forwardRef<EditorRef>(function Editor(props, ref) {
  const domRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [setNode, rect] = useDimensions();

  useEffect(() => {
    editorRef.current?.layout();
  }, [rect]);

  useEffect(() => {
    const editorInstance = monaco.editor.create(domRef.current!, {
      value: '',
      language: 'markdown',
      fixedOverflowWidgets: true,
      wordWrap: 'on',
      theme: 'vimark',
      padding: {
        top: 10,
      },

      scrollbar: {
        verticalScrollbarSize: 8,
      },
    });

    new MonacoMarkdownExtension().activate(editorInstance);

    editorRef.current = editorInstance;

    setNode(domRef.current?.parentElement || null);

    return () => {
      editorInstance.dispose();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => editorRef.current,
    }),
    [],
  );

  return <div className="fill-height" ref={domRef}></div>;
});
