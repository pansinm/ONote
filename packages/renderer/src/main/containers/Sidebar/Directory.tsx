import React, { useCallback, useRef } from 'react';
import type { FileTreeProps } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { Uri } from 'monaco-editor';
import FileTreeItem from '/@/components/FileTreeItem';

const Directory = observer(() => {
  const rootUri = stores.activationStore.rootUri;
  const treeItemRenderer: FileTreeProps['treeItemRenderer'] = useCallback(
    (treeNode: TreeNode) => (
      <FileTreeItem
        active={treeNode.uri === stores.activationStore.activeDirUri}
        treeNode={treeNode}
      />
    ),
    [],
  );
  const treeRef = useRef<React.ElementRef<typeof FileTree>>(null);
  return (
    <div style={{ flex: 1, width: '100%' }}>
      <FileTree
        ref={treeRef}
        onRootTreeChange={(root) =>
          root && treeRef.current?.expand(root.uri, true)
        }
        onTreeItemClick={(treeNode) => {
          const activeDir = stores.activationStore.activeDirUri;
          stores.activationStore.activeDir(treeNode.uri);
          const isSelected = activeDir === treeNode.uri;
          const expanded = isSelected ? !treeNode.expanded : true;
          treeRef.current?.expand(treeNode.uri, expanded);
        }}
        doFilter={(treeNode) => treeNode.type === 'directory'}
        onError={(err) => alert(err.message)}
        treeItemRenderer={treeItemRenderer}
        rootUri={rootUri}
        fileService={window.fileService}
        rowHeight={34}
      />
    </div>
  );
});

export default Directory;
