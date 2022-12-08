import type { FC } from 'react';
import React from 'react';
import '/@/common/emoji/emoji.scss';
import Sidebar from './containers/Sidebar';
import styles from './App.module.scss';
import FileList from './containers/FileList';
import ContentPanel from './containers/ContentPanel';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import stores from './stores';
import View from '../components/View';
import EventBus from './containers/EventBus';
import DragBar from '../components/DragBar';

function handleSidebarDrag(delta: number) {
  const sidebarEle = document.querySelector('.sidebar')!;
  const editorWidth = parseFloat(
    getComputedStyle(sidebarEle).getPropertyValue('width'),
  );

  const root = document.documentElement;

  const finalWidth = editorWidth + delta + 'px';
  root.style.setProperty('--sidebar-width', finalWidth);
}

function handleFileListDrag(delta: number) {
  const sidebarEle = document.querySelector('.file-list')!;
  const editorWidth = parseFloat(
    getComputedStyle(sidebarEle).getPropertyValue('width'),
  );

  const root = document.documentElement;

  const finalWidth = editorWidth + delta + 'px';
  root.style.setProperty('--file-list-width', finalWidth);
}

const App: FC = observer(() => {
  return (
    <div className={styles.App}>
      <div
        className="fill-height sidebar"
        style={{
          display: stores.activationStore.hideSidebar ? 'none' : 'block',
        }}
      >
        <Sidebar />
        <DragBar onStart={console.log} onStop={handleSidebarDrag} />
      </div>
      <div className="fill-height file-list">
        <FileList />
        <DragBar onStart={console.log} onStop={handleFileListDrag} />
      </div>
      <View
        flexDirection="column"
        className={classNames('fill-height', styles.ContentPanelWrapper)}
      >
        <ContentPanel />
      </View>
      <EventBus />
    </div>
  );
});

export default App;
