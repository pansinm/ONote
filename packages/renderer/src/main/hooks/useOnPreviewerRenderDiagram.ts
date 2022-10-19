import { useEffect } from 'react';
import previewerService from '../services/previewerService';
import type { PreviewerEventPayload } from '/@/common/EventPayload';

function usePreviewerRenderDiagram() {
  const handlerRender = ({
    taskId,
    code,
    lang,
    meta,
  }: PreviewerEventPayload['previewer.diagram.toRender']) => {
    switch (lang) {
      case 'plantuml':
        window.simmer
          .renderPlantUML(code, 'https://www.plantuml.com/plantuml')
          .then((res) => {
            previewerService.send('main.diagram.rendered', {
              taskId,
              svg: res as string,
            });
          })
          .catch((err) => {
            previewerService.send('main.diagram.rendered', {
              taskId,
              err,
            });
          });
        break;
      case 'graphviz':
        window.simmer
          .renderGraphviz(code, meta?.['engine'] || 'dot')
          .then((svg) => {
            previewerService.send('main.diagram.rendered', {
              taskId,
              svg: svg,
            });
          })
          .catch((err) => {
            previewerService.send('main.diagram.rendered', {
              taskId,
              err,
            });
          });
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    previewerService.on('previewer.diagram.toRender', handlerRender);
    return () => {
      previewerService.off('previewer.diagram.toRender', handlerRender);
    };
  }, []);
}

export default usePreviewerRenderDiagram;
