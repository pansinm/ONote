import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ele = ref.current?.parentElement;
    active ? ele?.classList.add('active') : ele?.classList.remove('active');
  }, [active]);
  return (
    <div
      ref={ref}
      title={decodeURIComponent(treeNode.uri)}
      onContextMenu={onContextMenu}
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
