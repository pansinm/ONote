import { TreeItem } from '@sinm/react-file-tree';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC } from 'react';
import React from 'react';
import { isEquals } from '/@/common/utils/uri';
import FileTreeItem from '/@/components/FileTreeItem';

interface SearchListProps {
  files: TreeNode[];
  activeUri: string;
  onItemClick(treeNode: TreeNode): void;
}

const SearchList: FC<SearchListProps> = ({ files, activeUri, onItemClick }) => {
  return (
    <>
      {files.map((node) => (
        <TreeItem
          key={node.uri}
          draggable={true}
          treeNode={node}
          style={{}}
          indent={0}
          activated={false}
          indentUnit={''}
          onClick={onItemClick}
          treeItemRenderer={function (treeNode: TreeNode) {
            return (
              <FileTreeItem
                treeNode={treeNode}
                active={isEquals(activeUri, treeNode.uri)}
              />
            );
          }}
        />
      ))}
    </>
  );
};

export default SearchList;
