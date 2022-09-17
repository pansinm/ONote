import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import styles from './index.module.scss';
import useDimensions from '../../../hooks/useDimensions';
import Button from '/@/components/Button';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import ListItem from '/@/components/ListItem';
import Directory from './Directory';
import Modal from '/@/components/Modal';
import ProjectSelect from '../../components/ProjectSelect';
import View from '/@/components/View';

export default observer(function ActivityBar() {
  const [ref] = useDimensions();
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.Sidebar} ref={ref}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Directory />
      </div>
      <Flex justifyContent={'space-between'}>
        <Button
          style={{ flex: 1 }}
          shape="rectangle"
          onClick={async () => {
            setOpen(true);
          }}
        >
          打开目录
        </Button>
        <Icon
          type="chevron-double-right"
          color="white"
          style={{ background: 'orange' }}
          onClick={() => {
            stores.activationStore.toggleSidebar();
          }}
        />
      </Flex>
      <Modal isOpen={open}>
        <View
          position="absolute"
          width={40}
          height={40}
          top={0}
          right={0}
          justifyContent="center"
          alignItems={'center'}
        >
          <Icon onClick={() => setOpen(false)} type="x" />
        </View>
        <ProjectSelect
          onSelect={(uri) => {
            setOpen(false);
            stores.activationStore.setRootUri(uri);
          }}
        />
      </Modal>
    </div>
  );
});
