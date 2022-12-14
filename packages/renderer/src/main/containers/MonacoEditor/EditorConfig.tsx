import type * as monaco from 'monaco-editor';
import useEditorOpen from './hooks/useEditorOpen';
import useEditorScrollRecover from './hooks/useEditorScrollRecover';
import useExtensions from './hooks/useExtensions';
import useLayout from './hooks/useLayout';
import useMarkdownExtensions from './hooks/useMarkdownExtensions';
import useModel from './hooks/useModel';
import useModelContentChange from './hooks/useModelContentChange';
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

  useModel(editor, uri);

  useModelContentChange(editor);

  useVim(editor);

  useExtensions(editor);

  useEditorOpen(editor);

  return null;
}

export default EditorConfig;
