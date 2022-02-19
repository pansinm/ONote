import { observer } from 'mobx-react-lite';
import React from 'react';
import styles from './index.module.scss';
import NotepadSection from './NotePadSection';
import useDimensions from '../../../hooks/useDimensions';
import Button from '/@/components/Button';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import ListItem from '/@/components/ListItem';
import Directory from './Directory';

export default observer(function ActivityBar() {
  const [ref] = useDimensions();
  return (
    <div className={styles.Sidebar} ref={ref}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <ListItem
          style={{ height: 40 }}
          onClick={() =>
            stores.activationStore.openResource({
              uri: 'onote://todos',
              type: 'todo',
              category: 'asset',
              changed: false,
            })
          }
        >
          任务清单
        </ListItem>
        <Directory />
      </div>
      <Flex justifyContent={'space-between'}>
        <Button
          style={{ flex: 1 }}
          shape="rectangle"
          onClick={async () => {
            const res = await window.simmer.openDirectory();
            if (res.filePaths?.[0]) {
              stores.openFolder(res.filePaths[0]);
            }
          }}
        >
          打开目录
        </Button>
        <Icon
          type="chevron-double-right"
          color="white"
          style={{ background: 'orange' }}
          onClick={() => {
            stores.toggleSidebar();
          }}
        />
      </Flex>
    </div>
  );
});
