import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC } from 'react';
import React from 'react';
import './FileTreeItem.scss';
import FileItemWithFileIcon from '@sinm/react-file-tree/lib/FileItemWithFileIcon';

interface FileTreeItemProps {
  treeNode: TreeNode;
  active: boolean;
  onContextMenu?(event: React.MouseEvent<HTMLDivElement>): void;
}

const FileTreeItem: FC<FileTreeItemProps> = ({
  treeNode,
  active,
  onContextMenu,
}) => {
  return (
    <div
      title={decodeURIComponent(treeNode.uri)}
      onContextMenu={onContextMenu}
      className={active ? 'activated' : undefined}
      style={{
        display: 'flex',
        paddingLeft: 10,
        alignItems: 'center',
        height: 30,
        width: '100%',
      }}
    >
      <FileItemWithFileIcon treeNode={treeNode} />
    </div>
  );
};

export default FileTreeItem;
