import React, { useRef, useEffect } from 'react';
import { HandlerRegistry } from './handlers/HandlerRegistry';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';
import { LLM_BOX_MESSAGE_TYPES } from '../../../llmbox/utils/constants';
import { getLogger } from '/@/shared/logger';
// 统一导入所有 Handler
import * as Handlers from './handlers';
import type { HandlerClass } from './handlers';

const logger = getLogger('LLMBoxFrame');

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current?.contentWindow) {
      return;
    }

    const channel = createChannel(
      ref.current.contentWindow,
      'MAIN_FRAME-LLM_BOX',
    );

    const handlerRegistry = new HandlerRegistry(channel);

    // 自动注册所有 Handler
    const allHandlers = Object.values(Handlers).filter(
      (h): h is HandlerClass =>
        typeof h === 'function' &&
        'getMessageType' in h &&
        typeof (h as any).getMessageType === 'function',
    );

    logger.info(`Registering ${allHandlers.length} handlers...`);
    allHandlers.forEach((Handler) => handlerRegistry.register(Handler));
    logger.info('All handlers registered successfully');

    // 启动消息监听
    handlerRegistry.serve();

    const contentChanged = subscription.subscribe(
      EDITOR_CONTENT_CHANGED,
      (data) => {
        channel.send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED,
          data,
        });
      },
    );

    const selectionChanged = subscription.subscribe(
      EDITOR_SELECTION_CHANGED,
      (data) => {
        channel.send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED,
          data,
        });
      },
    );

    const activeFileDisposer = reaction(
      () => stores.activationStore.activeFileUri,
      (uri) => {
        if (uri) {
          channel.send({
            type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
            data: { uri, rootUri: stores.activationStore.rootUri },
          });
        }
      },
    );

    return () => {
      contentChanged.dispose();
      selectionChanged.dispose();
      activeFileDisposer();
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
