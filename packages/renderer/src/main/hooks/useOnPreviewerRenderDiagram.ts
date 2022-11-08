import { useEffect } from 'react';
import previewerService from '../services/previewerService';
import stores from '../stores';
import {
  PLANTUML_ENDPOINT,
  PLANTUML_USECACHE,
} from '/@/common/constants/SettingKey';
import type { PreviewerEventPayload } from '/@/common/EventPayload';

function usePreviewerRenderDiagram() {
  const handlerRender = ({
    taskId,
    code,
    lang,
    meta,
  }: PreviewerEventPayload['previewer.diagram.toRender']) => {
    const plantumlEndpoint =
      (stores.settingStore.settings[PLANTUML_ENDPOINT] as string) ||
      'https://www.plantuml.com/plantuml';
    const plantumlUseCache = stores.settingStore.settings[
      PLANTUML_USECACHE
    ] as boolean;
    switch (lang) {
      case 'plantuml':
        window.simmer
          .renderPlantUML(code, plantumlEndpoint, plantumlUseCache)
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
