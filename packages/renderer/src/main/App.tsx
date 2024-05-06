import type { FC } from 'react';
import React from 'react';
import '/@/common/emoji/emoji.scss';
import Sidebar from './containers/Sidebar';
import styles from './App.module.scss';
import { observer } from 'mobx-react-lite';
import stores from './stores';
import EventBus from './containers/EventBus';
import DragBar from '../components/DragBar';
import Page from './containers/Page';

function handleSidebarDrag(delta: number) {
  const sidebarEle = document.querySelector('.sidebar')!;
  const editorWidth = parseFloat(
    getComputedStyle(sidebarEle).getPropertyValue('width'),
  );

  const root = document.documentElement;

  const finalWidth = editorWidth + delta + 'px';
  root.style.setProperty('--sidebar-width', finalWidth);
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
      <Page />
      <EventBus />
    </div>
  );
});

export default App;
