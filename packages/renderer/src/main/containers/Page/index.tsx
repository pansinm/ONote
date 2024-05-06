import React from 'react';
import classNames from 'classnames';
import styles from './Index.module.scss';
import FileList from '../../containers/FileList';
import ContentPanel from '../../containers/ContentPanel';
import stores from '../../stores';
import View from '/@/components/View';
import DragBar from '/@/components/DragBar';
import TodoPage from '../TodoPage/TodoPage';
import { observer } from 'mobx-react-lite';

const Page = () => {
  function handleFileListDrag(delta: number) {
    const sidebarEle = document.querySelector('.file-list')!;
    const editorWidth = parseFloat(
      getComputedStyle(sidebarEle).getPropertyValue('width'),
    );

    const root = document.documentElement;

    const finalWidth = editorWidth + delta + 'px';
    root.style.setProperty('--file-list-width', finalWidth);
  }

  if (stores.activationStore.activatedPage === 'todo') {
    return <TodoPage />;
  }

  return (
    <>
      <div className="fill-height file-list">
        <FileList />
        <DragBar onStart={console.log} onStop={handleFileListDrag} />
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
    </>
  );
};

export default observer(Page);
