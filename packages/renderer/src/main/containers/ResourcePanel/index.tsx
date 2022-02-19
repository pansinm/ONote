import { observer } from 'mobx-react-lite';
import React from 'react';
import MarkdownResourcePanel from './MarkdownResourcePanel';
import TodoResourcePanel from './TodoResourcePannel';
import stores from '../../stores';

const ResourcePanel = observer(() => {
  const activatedUri = stores.activationStore.activeFileUri;
  return (
    <>
      <MarkdownResourcePanel
        visible={/\.md$/.test(activatedUri)}
        uri={activatedUri}
      />
      {/todo/.test(activatedUri) ? (
        <TodoResourcePanel uri={activatedUri} />
      ) : null}
    </>
  );
});

export default ResourcePanel;
