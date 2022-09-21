import { observer } from 'mobx-react-lite';
import React from 'react';
import ResourcePanel from '../FileBrowser';
import ResourceTabs from '../ResourceTabs';
import stores from '../../stores';

const ContentPanel = observer(() => {
  if (!stores.activationStore.openedFiles.length) {
    return <div>Empty~~</div>;
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
