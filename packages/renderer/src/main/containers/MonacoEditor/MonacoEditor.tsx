import { observer } from 'mobx-react-lite';
import type * as monaco from 'monaco-editor';
import type { FC } from 'react';
import React from 'react';
import useEditor from './hooks/useEditor';
import useEditorScrollRecover from './hooks/useEditorScrollRecover';
import useMarkdownExtensions from './hooks/useMarkdownExtensions';
import useLayout from './hooks/useLayout';
import usePreviewerRPC from './hooks/usePreviewerRPC';
import useModel from './hooks/useModel';
import useModelContentChange from './hooks/useModelContentChange';

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

const MonacoEditor: FC<MonacoEditorProps> = function Editor(props) {
  const { editor, containerRef } = useEditor();
  // 加载插件
  useMarkdownExtensions(editor);
  // 切换文件时，切换滚动条
  useEditorScrollRecover(editor);
  // 重新调整大小
  useLayout(editor, containerRef.current);
  // 和previewer通信
  usePreviewerRPC(editor);

  useModel(editor, props.uri);

  useModelContentChange(editor);

  return <div className="fullfill" ref={containerRef}></div>;
};

export default observer(MonacoEditor);
