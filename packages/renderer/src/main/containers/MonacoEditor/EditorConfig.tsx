import type * as monaco from 'monaco-editor';
import useEditorScrollRecover from './hooks/useEditorScrollRecover';
import useLayout from './hooks/useLayout';
import useMarkdownExtensions from './hooks/useMarkdownExtensions';
import useModel from './hooks/useModel';
import useModelContentChange from './hooks/useModelContentChange';
import usePreviewerRPC from './hooks/usePreviewerRPC';
import useVim from './hooks/useVim';
function EditorConfig({
  editor,
  uri,
}: {
  uri: string;
  editor?: monaco.editor.IStandaloneCodeEditor;
}) {
  // 加载插件
  useMarkdownExtensions(editor);
  // 切换文件时，切换滚动条
  useEditorScrollRecover(editor);
  // 和previewer通信
  usePreviewerRPC(editor);

  useModel(editor, uri);

  useModelContentChange(editor);

  useVim(editor);
  return null;
}

export default EditorConfig;
