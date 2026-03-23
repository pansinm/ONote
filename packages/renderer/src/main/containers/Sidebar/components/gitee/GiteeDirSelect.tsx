import { Button } from '@fluentui/react-components';
import type { FileTreeProps, TreeNode } from '@sinm/react-file-tree';
import { utils } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { orderBy } from 'lodash';
import type { FC } from 'react';
import { useEffect } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileTreeItem from '/@/components/FileTreeItem';
import View from '/@/components/View';
import { isEquals } from '/@/common/utils/uri';
import fileService from '/@/main/services/fileService';

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

const GiteeDirSelect: FC<SSHDirSelectProps> = (props) => {
  const { t } = useTranslation('common');
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
      fileService.listDir(treeNode.uri).then((children) => {
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
    fileService.getTreeNode('file:///').then((node) => {
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
    const pathname = new URL(treeNode.uri).pathname;
    const [, namespace, repo] = pathname.split('/');
    if (!repo) {
      toggleExpanded(treeNode);
    }
    if (repo) {
      setSelected(treeNode.uri);
    }
  };
  return (
    <View flex={1} flexDirection="column">
      <View height={200}>
        <FileTree
          tree={tree}
          sorter={sorter}
          emptyRenderer={() => <div>{t('pleaseWait')}</div>}
          itemRenderer={itemRenderer}
          onItemClick={handleItemClick}
        ></FileTree>
      </View>
      <View paddingTop={10} justifyContent="flex-end">
        <Button appearance="primary" onClick={handleClick}>
          {t('open')}
        </Button>
      </View>
    </View>
  );
};

export default GiteeDirSelect;
