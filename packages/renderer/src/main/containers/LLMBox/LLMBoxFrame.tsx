import React, { useRef } from 'react';
import stores from '../../stores';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('LLMBoxFrame');

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

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
