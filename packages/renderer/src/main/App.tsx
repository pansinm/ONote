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

const App: FC = observer(() => {
  return (
    <div className={styles.App}>
      <div
        className="fill-height"
        style={{
          minWidth: 200,
          width: 200,
          display: stores.activationStore.hideSidebar ? 'none' : 'block',
        }}
      >
        <Sidebar />
      </div>
      <div
        className="fill-height"
        style={{ minWidth: 230, width: 230, position: 'relative' }}
      >
        <FileList />
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
