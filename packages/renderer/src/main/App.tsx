import type { FC } from 'react';
import React, { useRef, useEffect } from 'react';
import '/@/common/emoji/emoji.scss';
import Sidebar from './containers/Sidebar';
import styles from './App.module.scss';
import { observer } from 'mobx-react-lite';
import stores from './stores';
import EventBus from './containers/EventBus';
import ContentPanel from './containers/ContentPanel';
import { getLogger } from '/@/shared/logger';
import ErrorBoundary from '../components/ErrorBoundary';
import { DragIndicator, DragHandle } from '/@/components/DragBarNew';
import { useResizable } from '/@/common/hooks/useResizable';
import useToast from '/@/hooks/useToast';
import Pop from '/@/utils/Pop';

const logger = getLogger('App');

const App: FC = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dragState, startDrag } = useResizable({ containerRef });
  const { showToast, Toast } = useToast();

  useEffect(() => {
    Pop.setToast(showToast);
    return () => {
      Pop.setToast(null);
    };
  }, [showToast]);

  return (
    <ErrorBoundary
      onError={(error) => {
        logger.error('App component error', error);
      }}
    >
      <div className={styles.App} ref={containerRef}>
        <div
          className="fill-height sidebar"
          style={{
            display: stores.activationStore.hideSidebar ? 'none' : 'block',
            position: 'relative',
          }}
        >
          <Sidebar />
          <DragHandle
            type="sidebar"
            right="-5px"
            onStartDrag={startDrag}
            isDragging={dragState.isDragging && dragState.type === 'sidebar'}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            maxWidth: stores.activationStore.hideSidebar
              ? '100vw'
              : 'calc(100vw - var(--sidebar-width))',
          }}
        >
          <ContentPanel />
        </div>
        <EventBus />
        <DragIndicator
          visible={dragState.isDragging}
          x={dragState.currentX}
          height="100%"
        />
        <Toast />
      </div>
    </ErrorBoundary>
  );
});

export default App;
