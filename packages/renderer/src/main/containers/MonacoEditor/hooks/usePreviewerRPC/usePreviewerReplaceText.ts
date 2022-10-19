import { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import previewerService from '/@/main/services/previewerService';
import type { PreviewerEventPayload } from '/@/common/EventPayload';

const usePreviewerReplaceText = (
  editor?: monaco.editor.IStandaloneCodeEditor,
) => {
  useEffect(() => {
    const handler = ({
      uri,
      range,
      text,
    }: PreviewerEventPayload['previewer.replaceText']) => {
      const model = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (model) {
        model.applyEdits([
          {
            range,
            text,
          },
        ]);
      }
    };
    previewerService.on('previewer.replaceText', handler);
    return () => {
      previewerService.off('previewer.replaceText', handler);
    };
  }, [editor]);
};
export default usePreviewerReplaceText;
