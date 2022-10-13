import { observer } from 'mobx-react-lite';
import * as monaco from 'monaco-editor';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { useEffect } from 'react';
import { useEvent, useLatest } from 'react-use';
import useDimensions from '../../../hooks/useDimensions';
import { MonacoMarkdownExtension } from '../../../simmer-markdown/src/ts';
import { registerActions } from '../../monaco/editor';
import stores from '../../stores';

export type EditorRef = {
  getInstance: () => monaco.editor.IStandaloneCodeEditor | undefined;
};

interface MonacoEditorProps {
  uri: string;
  needLoad?: boolean;
  onScroll?(): void;
  onModelChange?(fromUri: string, toUri: string): void;
  onContentChange?(uri: string): void;
}

const MonacoEditor = forwardRef<EditorRef, MonacoEditorProps>(function Editor(
  props,
  ref,
) {
  const domRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    const editorInstance = monaco.editor.create(domRef.current!, {
      value: '',
      language: 'markdown',
      fixedOverflowWidgets: true,
      // wordWrap: 'on',
      // theme: '',
      padding: {
        top: 10,
      },
      scrollbar: {
        verticalScrollbarSize: 8,
      },
      unicodeHighlight: {
        ambiguousCharacters: false,
      },
    });

    new MonacoMarkdownExtension().activate(editorInstance);
    registerActions(editorInstance);

    editorRef.current = editorInstance;

    setNode(domRef.current?.parentElement || null);

    editorInstance.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      function () {
        const model = editorInstance.getModel();
        if (model) {
          stores.fileStore.saveFile(model.uri.toString(), model.getValue());
        }
      },
    );

    editorInstance.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
      function () {
        (editorInstance as any)._commandService.executeCommand(
          'editor.action.clipboardPasteAction',
        );
      },
    );

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

  const latestUri = useLatest(props.uri);
  const loadModel = useCallback(async (uri: string) => {
    const model = await stores.fileStore.getOrCreateModel(uri);
    if (model.uri.toString() === latestUri.current) {
      editorRef.current?.setModel(model);
    }
  }, []);

  useEffect(() => {
    if (props.uri && props.needLoad) {
      loadModel(props.uri);
    }
  }, [props.uri]);

  const [setNode, rect] = useDimensions();

  useEffect(() => {
    editorRef.current?.layout();
  }, [rect]);

  return <div className="fill-height" ref={domRef}></div>;
});

export default observer(MonacoEditor);
