import { Button } from '@fluentui/react-components';
import type { FileTreeProps, TreeNode } from '@sinm/react-file-tree';
import { utils } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { orderBy } from 'lodash';
import type { FC } from 'react';
import { useEffect } from 'react';
import React, { useState } from 'react';
import FileTreeItem from '/@/components/FileTreeItem';
import View from '/@/components/View';
import { currentDataSource } from '/@/main/ipc';
import { isEquals } from '/@/common/utils/uri';

interface SSHDirSelectProps {
  onOpen(uri: string): void;
}
// directory first and filename dict sort
const sorter = (treeNodes: TreeNode[]) =>
  orderBy(
    treeNodes,
    [
      (node) => (node.type === 'directory' ? 0 : 1),
      (node) => utils.getFileName(node.uri),
    ],
    ['asc', 'asc'],
  );

const SSHDirSelect: FC<SSHDirSelectProps> = (props) => {
  const [selected, setSelected] = useState('');
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);

  const toggleExpanded = (treeNode: TreeNode) => {
    const loading = !treeNode.children;
    setTree((t) =>
      utils.assignTreeNode(t, treeNode.uri, {
        expanded: !treeNode.expanded,
        loading,
      } as any),
    );
    if (loading) {
      currentDataSource.listDir(treeNode.uri).then((children) => {
        setTree((t) =>
          utils.assignTreeNode(t, treeNode.uri, {
            loading: false,
            children: children.filter((child) => child.type === 'directory'),
          } as any),
        );
      });
    }
  };
  useEffect(() => {
    currentDataSource.getTreeNode('file:///').then((node) => {
      setTree(node);
      toggleExpanded(node);
    });
  }, []);
  const itemRenderer: FileTreeProps['itemRenderer'] = (treeNode) => {
    return (
      <FileTreeItem
        active={isEquals(selected, treeNode.uri)}
        treeNode={treeNode}
      />
    );
  };
  const handleClick = () => {
    if (!selected) {
      return;
    }
    props.onOpen(selected);
  };
  const handleItemClick = (treeNode: TreeNode) => {
    toggleExpanded(treeNode);
    setSelected(treeNode.uri);
  };
  return (
    <View flex={1} flexDirection="column">
      <View flex={1}>
        <FileTree
          tree={tree}
          sorter={sorter}
          itemRenderer={itemRenderer}
          onItemClick={handleItemClick}
        ></FileTree>
      </View>
      <View paddingTop={10} justifyContent="flex-end">
        <Button appearance="primary" onClick={handleClick}>
          打开
        </Button>
      </View>
    </View>
  );
};

export default SSHDirSelect;
