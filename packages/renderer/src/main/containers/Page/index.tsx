import React, { useRef } from 'react';
import classNames from 'classnames';
import styles from './Index.module.scss';
import FileList from '../../containers/FileList';
import ContentPanel from '../../containers/ContentPanel';
import stores from '../../stores';
import View from '/@/components/View';
import TodoPage from '../TodoPage/TodoPage';
import { observer } from 'mobx-react-lite';
import { DragIndicator, DragHandle } from '/@/components/DragBarNew';
import { useResizable } from '/@/common/hooks/useResizable';

const Page = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dragState, startDrag } = useResizable({ containerRef });

  if (stores.activationStore.activatedPage === 'todo') {
    return <TodoPage />;
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flex: 1, position: 'relative' }}>
      <div className="fill-height file-list" style={{ position: 'relative' }}>
        <FileList />
        <DragHandle
          type="file-list"
          right="-2px"
          onStartDrag={startDrag}
        />
      </div>
      <View
        flexDirection="column"
        maxWidth={
          stores.activationStore.hideSidebar
            ? 'calc(100vw - var(--file-list-width))'
            : 'calc(100vw - var(--file-list-width) - var(--sidebar-width))'
        }
        className={classNames('fill-height', styles.ContentPanelWrapper)}
      >
        <ContentPanel />
      </View>
      <DragIndicator
        visible={dragState.isDragging}
        x={dragState.currentX}
        height="100%"
      />
    </div>
  );
};

export default observer(Page);
