import { observer } from 'mobx-react-lite';
import type * as monaco from 'monaco-editor';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { useEffect } from 'react';
import { useLatest } from 'react-use';
import useDimensions from '../../../hooks/useDimensions';
import { MonacoMarkdownExtension } from '../../../simmer-markdown/src/ts';
import { activate, createEditor } from '../../monaco';
import scrollService from '../../services/scrollService';
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
    const editorInstance = createEditor(domRef.current!);

    new MonacoMarkdownExtension().activate(editorInstance);
    activate(editorInstance);

    editorRef.current = editorInstance;
    const disposer = editorInstance.onDidChangeModel((e) => {
      const top = scrollService.getScrollTop(
        e.newModelUrl?.toString() as string,
      );
      editorInstance.setScrollTop(top);
    });
    setNode(domRef.current?.parentElement || null);

    return () => {
      disposer.dispose();
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
