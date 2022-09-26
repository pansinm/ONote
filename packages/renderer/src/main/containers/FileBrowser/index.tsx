import { observer } from 'mobx-react-lite';
import React from 'react';
import MarkdownPanel from './MarkdownPanel';
import stores from '../../stores';
import PlainTextPanel from './PlainTextPanel';
import { isMarkdown, isPlaintext } from '/@/utils/uri';



const ResourcePanel = observer(() => {
  const activatedUri = stores.activationStore.activeFileUri;

  return (
    <>
      <MarkdownPanel visible={isMarkdown(activatedUri)} uri={activatedUri} />
      {isPlaintext(activatedUri) && <PlainTextPanel uri={activatedUri} />}
    </>
  );
});

export default ResourcePanel;
