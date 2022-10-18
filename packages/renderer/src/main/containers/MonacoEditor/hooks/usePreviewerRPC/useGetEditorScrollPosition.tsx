import { useEffect } from 'react';
import type * as monaco from 'monaco-editor';
import previewerService from '/@/main/services/previewerService';

const useGetEditorScrollPosition = (
  editor?: monaco.editor.IStandaloneCodeEditor,
) => {
  useEffect(() => {
    const handler = () => {
      const model = editor?.getModel();
      previewerService.send('main.getEditorScrollPosition:response', {
        uri: model?.uri.toString() || '',
        lineNumber: editor?.getVisibleRanges()?.[0].startLineNumber || 0,
      });
    };
    previewerService.on('previewer.getEditorScrollPosition', handler);
    return () => {
      previewerService.off('previewer.getEditorScrollPosition', handler);
    };
  }, [editor]);
};
export default useGetEditorScrollPosition;
