import React, { useEffect, useRef } from 'react';
import { createChannel } from 'bidc';
import stores from '../../stores';
import eventbus from '../../eventbus/eventbus';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

    const contentChanged = subscription.subscribe(
      EDITOR_CONTENT_CHANGED,
      (data) => {
        send({
          type: EDITOR_CONTENT_CHANGED,
          data,
        });
      },
    );

    const selectionChanged = subscription.subscribe(
      EDITOR_SELECTION_CHANGED,
      (data) => {
        send({
          type: EDITOR_SELECTION_CHANGED,
          data,
        });
      },
    );

    return () => {
      contentChanged.dispose();
      selectionChanged.dispose();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="LLMBox"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
      }}
      src={stores.layoutStore.sidebarUrl}
    />
  );
}

export default LLMBoxFrame;
