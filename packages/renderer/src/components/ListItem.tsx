import classNames from 'classnames';
import { memo } from 'react';
import type {
  CSSProperties,
  FC,
  MouseEventHandler,
  DragEventHandler,
} from 'react';
import React from 'react';
import Icon from './Icon';
import styles from './ListItem.module.scss';

export interface ListItemProps {
  className?: string;
  style?: CSSProperties;
  active?: boolean;
  hoverBackground?: string;
  activeBackground?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onClick?: () => void;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
  onDragStart?: DragEventHandler<HTMLDivElement>;
}
const Listitem: FC<ListItemProps> = ({
  className,
  children,
  style,
  active,
  activeBackground = '#1e90ff',
  hoverBackground = 'rgba(0,0,0,0.05)',
  onClose,
  onClick,
  onDragStart,
  onContextMenu,
}) => {
  return (
    <div
      className={classNames(styles.ListItem, className, { active })}
      style={
        {
          '--list-item-active-background': activeBackground,
          '--list-item-hover-background': hoverBackground,
          ...style,
        } as CSSProperties
      }
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onContextMenu={onContextMenu}
      onClick={() => onClick?.()}
    >
      <span>{children}</span>
      {onClose ? (
        <Icon
          type="x"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
      ) : null}
    </div>
  );
};

export default memo<ListItemProps>(Listitem);
