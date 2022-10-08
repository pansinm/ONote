import type { FC } from 'react';
import React from 'react';
import '/@/emoji/emoji.scss';
import Sidebar from './containers/Sidebar';
import styles from './App.module.scss';
import NoteList from './containers/FileList';
import ContentPanel from './containers/ContentPanel';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import stores from './stores';
import Icon from '/@/components/Icon';
import View from '../components/View';

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
        <NoteList />
        {stores.activationStore.hideSidebar ? (
          <Icon
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 34,
              background: 'orange',
            }}
            color="white"
            type="chevron-double-left"
            onClick={() => {
              stores.activationStore.toggleSidebar();
            }}
          ></Icon>
        ) : null}
      </div>
      <View
        flexDirection="column"
        className={classNames('fill-height', styles.ContentPanelWrapper)}
      >
        <ContentPanel />
      </View>
    </div>
  );
});

export default App;
