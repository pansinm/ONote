import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import React from 'react';
import FileIcon from './FileIcon';
import './FileTreeItem.scss';

interface FileTreeItemProps {
  treeNode: TreeNode;
  active: boolean;
}

const FileTreeItem: FC<FileTreeItemProps> = ({ treeNode, active }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ele = ref.current?.parentElement;
    active ? ele?.classList.add('active') : ele?.classList.remove('active');
  }, [active]);
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        paddingLeft: 10,
        alignItems: 'center',
        height: 30,
      }}
    >
      <FileIcon
        isDirectory={treeNode.type === 'directory'}
        expanded={treeNode.expanded}
        uri={treeNode.uri}
        style={{ marginRight: 5 }}
        size={20}
      />
      <span className="text-ellipsis">
        {decodeURIComponent(treeNode.uri.split('/').pop() || '')}
      </span>
    </div>
  );
};

export default FileTreeItem;
