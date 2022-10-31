import { observer } from 'mobx-react-lite';
import React from 'react';
import ResourcePanel from '../FileBrowser';
import ResourceTabs from '../ResourceTabs';
import stores from '../../stores';
import { BeachRegular } from '@fluentui/react-icons';
import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    fontSize: '150px',
  },
});

const ContentPanel = observer(() => {
  const styles = useStyles();
  if (!stores.activationStore.openedFiles.length) {
    return (
      <div className={styles.empty}>
        <BeachRegular primaryFill="#ebf3fc" />
      </div>
    );
  }
  return (
    <div className="fullfill">
      <ResourceTabs />
      <div style={{ height: 'calc(100% - 40px)', position: 'relative' }}>
        <ResourcePanel />
      </div>
    </div>
  );
});

export default ContentPanel;
