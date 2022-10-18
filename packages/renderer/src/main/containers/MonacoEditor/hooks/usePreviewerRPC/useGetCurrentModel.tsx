import { useEffect } from 'react';
import type * as monaco from 'monaco-editor';
import previewerService from '/@/main/services/previewerService';

const useGetCurrentModel = (editor?: monaco.editor.IStandaloneCodeEditor) => {
  useEffect(() => {
    const handler = () => {
      const model = editor?.getModel();
      previewerService.send('main.getCurrentModel:response', {
        uri: model?.uri.toString() || '',
        content: model?.getValue() || '',
      });
    };
    previewerService.on('previewer.getCurrentModel', handler);
    return () => {
      previewerService.off('previewer.getCurrentModel', handler);
    };
  }, [editor]);
};
export default useGetCurrentModel;
