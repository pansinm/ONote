import type * as monaco from 'monaco-editor';
import useEditorScrollSync from './useEditorScrollSync';
import useGetCurrentModel from './useGetCurrentModel';
import useGetEditorScrollPosition from './useGetEditorScrollPosition';
import useOnModelChange from './useOnModelChange';
import usePreviewerReplaceText from './usePreviewerReplaceText';

export default function usePreviewerRPC(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  useGetCurrentModel(editor);
  useGetEditorScrollPosition(editor);
  useEditorScrollSync(editor);
  useOnModelChange(editor);
  usePreviewerReplaceText(editor);
}
