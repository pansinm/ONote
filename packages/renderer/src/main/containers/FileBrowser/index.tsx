import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import tunnelPool from '../../services/tunnelPoolService';
import stores from '../../stores';
import FilePanel from './FilePannel';

const ResourcePanel = observer(() => {
  const activatedUri = stores.activationStore.activeFileUri;
  useEffect(() => {
    return () => {
      tunnelPool.closeAll();
    };
  }, []);
  return (
    <>
      {/* <MarkdownPanel visible={isMarkdown(activatedUri)} uri={activatedUri} />
      {isPlaintext(activatedUri) && <PlainTextPanel uri={activatedUri} />}
      {isUnSupport(activatedUri) && <UnSupport uri={activatedUri} />} */}
      <FilePanel uri={activatedUri} />
    </>
  );
});

export default ResourcePanel;
