import type { FC } from 'react';
import React, { useRef } from 'react';
import '/@/common/emoji/emoji.scss';
import Sidebar from './containers/Sidebar';
import styles from './App.module.scss';
import { observer } from 'mobx-react-lite';
import stores from './stores';
import EventBus from './containers/EventBus';
import Page from './containers/Page';
import { getLogger } from '/@/shared/logger';
import ErrorBoundary from '../components/ErrorBoundary';
import { DragIndicator, DragHandle } from '/@/components/DragBarNew';
import { useResizable } from '/@/common/hooks/useResizable';

const logger = getLogger('App');

const App: FC = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dragState, startDrag } = useResizable({ containerRef });

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
            right="-2px"
            onStartDrag={startDrag}
          />
        </div>
        <Page />
        <EventBus />
        <DragIndicator
          visible={dragState.isDragging}
          x={dragState.currentX}
          height="100%"
        />
      </div>
    </ErrorBoundary>
  );
});

export default App;
