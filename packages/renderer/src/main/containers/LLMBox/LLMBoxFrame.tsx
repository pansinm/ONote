import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import stores from '../../stores';
import { getLogger } from '/@/shared/logger';
import { createChannel } from 'bidc';
import { LLMBOX_CHANNEL_ID, LLMBOX_IPC_TYPES } from '/@/llmbox/ipc';
import { assistant } from '../../assistant';

const logger = getLogger('LLMBoxFrame');

function LLMBoxFrame() {
  const { t } = useTranslation('common');
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const channel = createChannel(
      ref.current!.contentWindow!,
      LLMBOX_CHANNEL_ID,
    );

    channel.receive(
      async (payload: { type: string; args: any; callback: any }) => {
        logger.debug('RECEIVE LLMBOX:', payload);
        switch (payload.type) {
          case LLMBOX_IPC_TYPES.SEND_MESSAGE:
            await assistant.chat(payload.args.input, payload.args.callback);
            return {};
          default:
            logger.debug(`UNKNOWN TYPE ${payload.type}`);
        }
      },
    );
  }, []);

  return (
    <iframe
      ref={ref}
      title={t('agentTitle')}
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
