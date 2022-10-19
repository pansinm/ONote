import React, { useEffect } from 'react';
import eventbus from '../../eventbus';
import stores from '../../stores';
import { EDITOR_FILE_SAVE } from '../../eventbus/EventName';
import useOnPreviewerRenderDiagram from '../../hooks/useOnPreviewerRenderDiagram';

const EventBus = () => {
  useOnPreviewerRenderDiagram();
  useEffect(() => {
    const handler = (uri: string) => {
      stores.fileStore.save(uri);
    };
    eventbus.on(EDITOR_FILE_SAVE, handler);
    return () => {
      eventbus.off(EDITOR_FILE_SAVE, handler);
    };
  }, []);
  return null;
};

export default EventBus;
