import type * as monaco from 'monaco-editor';
import useEditorScrollSync from './useEditorScrollSync';
import useOnModelChange from './useOnModelChange';

export default function usePreviewerRPC(
  editor?: monaco.editor.IStandaloneCodeEditor,
) {
  useEditorScrollSync(editor);
  useOnModelChange(editor);
}
