import type { FileTreeProps } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import Button from '/@/components/Button';
import FileTreeItem from '/@/components/FileTreeItem';
import View from '/@/components/View';

interface SSHDirSelectProps {
  onOpen(uri: string): void;
}
const SSHDirSelect: FC<SSHDirSelectProps> = (props) => {
  const [selected, setSelected] = useState('');
  const treeRef = useRef<React.ElementRef<typeof FileTree>>(null);

  const itemRenderer: FileTreeProps['treeItemRenderer'] = (treeNode) => {
    return (
      <FileTreeItem active={selected === treeNode.uri} treeNode={treeNode} />
    );
  };
  const handleClick = () => {
    if (!selected) {
      return;
    }
    props.onOpen(selected);
  };
  return (
    <View flex={1} flexDirection="column">
      <View flex={1}>
        <FileTree
          ref={treeRef}
          rootUri="file:///"
          treeItemRenderer={itemRenderer}
          onTreeItemClick={(node) => {
            const isSelected = node.uri === selected;
            setSelected(node.uri);
            const expanded = isSelected ? !node.expanded : true;
            treeRef.current?.expand(node.uri, expanded);
          }}
          doFilter={(node) => node.type === 'directory'}
          onError={(err) => alert(err.message)}
          onRootTreeChange={(root) => {
            root && treeRef.current?.expand(root?.uri, true);
          }}
          fileService={window.fileService}
        ></FileTree>
      </View>
      <View paddingTop={10} justifyContent="flex-end">
        <Button onClick={handleClick}>打开</Button>
      </View>
    </View>
  );
};

export default SSHDirSelect;
