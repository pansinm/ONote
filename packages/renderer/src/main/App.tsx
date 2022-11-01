import type { FC } from 'react';
import React from 'react';
import '/@/emoji/emoji.scss';
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
      {!stores.activationStore.hideSidebar ? (
        <div className="fill-height" style={{ minWidth: 200, width: 200 }}>
          <Sidebar />
        </div>
      ) : null}
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
