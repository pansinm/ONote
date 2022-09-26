import { observer } from 'mobx-react-lite';
import React from 'react';
import MarkdownPanel from './MarkdownPanel';
import stores from '../../stores';
import PlainTextPanel from './PlainTextPanel';

const fileType = (uri: string) => {
  if (/\.mdx?$/i.test(uri)) {
    return 'markdown';
  }
  if (/^\.[^.]$/.test(uri) || /\.(txt|jsx?|tsx|html)$/.test(uri)) {
    return 'plaintext';
  }
};

const ResourcePanel = observer(() => {
  const activatedUri = stores.activationStore.activeFileUri;

  return (
    <>
      <MarkdownPanel
        visible={fileType(activatedUri) === 'markdown'}
        uri={activatedUri}
      />
      {fileType(activatedUri) === 'plaintext' && (
        <PlainTextPanel uri={activatedUri} />
      )}
    </>
  );
});

export default ResourcePanel;
