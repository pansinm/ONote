import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { IContext } from 'docx';
import type { CSSProperties, FC } from 'react';
import React from 'react';
import type { IConProps, IconType } from './Icon';
import Icon from './Icon';

type FileIconProps = {
  uri: string;
  isDirectory?: boolean;
  expanded?: boolean;
  style?: CSSProperties;
} & Omit<IConProps, 'type'>;

function getIconType(
  uri: string,
  isDirectory?: boolean,
  expanded?: boolean,
): { type: IconType; color: string } {
  if (isDirectory) {
    return {
      type: expanded ? 'folder2-open' : 'folder',
      color: expanded ? '#ffa602' : '#ff8833',
    };
  }
  return { type: 'file-text', color: '#23c2db' };
}

const FileIcon: FC<FileIconProps> = ({
  uri,
  isDirectory,
  expanded,
  ...rest
}) => {
  return <Icon {...rest} {...getIconType(uri, isDirectory, expanded)} />;
};

export default FileIcon;
