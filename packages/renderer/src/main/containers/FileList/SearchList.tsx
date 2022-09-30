import { TreeItem } from '@sinm/react-file-tree';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { CSSProperties, FC } from 'react';
import React from 'react';
import FileTreeItem from '/@/components/FileTreeItem';
import Flex from '/@/components/Flex';

interface SearchListProps {
  files: TreeNode[];
  activeUri: string;
  style?: CSSProperties;
  onItemClick(treeNode: TreeNode): void;
}
const SearchList: FC<SearchListProps> = (props) => {
  return (
    <Flex flexDirection="column" background={'#eee'} {...props.style}>
      {props.files.map((node) => {
        return (
          <TreeItem
            key={node.uri}
            draggable={true}
            treeNode={node}
            style={{}}
            indent={0}
            indentUnit={''}
            onClick={props.onItemClick}
            treeItemRenderer={function (treeNode: TreeNode) {
              return (
                <FileTreeItem
                  treeNode={treeNode}
                  active={props.activeUri === treeNode.uri}
                ></FileTreeItem>
              );
            }}
          ></TreeItem>
        );
      })}
    </Flex>
  );
};

export default SearchList;
