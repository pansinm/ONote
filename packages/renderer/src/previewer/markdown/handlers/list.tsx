import React from 'react';
import type { List } from 'mdast';
import Block from './components/Block';
import Icon from '/@/components/Icon';
import { replaceNode } from '../../utils/md';
import _ from 'lodash';
import classNames from 'classnames';
import { createLineClass } from './util/position';
import type { ICtx } from '../types';

export default function list(node: List, ctx: ICtx) {
  const List = node.ordered ? 'ol' : 'ul';
  const children = ctx.renderChildren(node, ctx);

  const isTaskList = node.children.find(
    (node) => typeof node.checked === 'boolean',
  );

  const className = classNames(createLineClass(node.position), {
    'task-list-item': isTaskList,
  });

  const ele = (
    <List className={className}>
      {children?.map((child: React.ReactElement, index) =>
        React.cloneElement(child, { key: index }),
      )}
    </List>
  );

  const handleSort = () => {
    const sorted = {
      ...node,
      children: _.orderBy(node.children, 'checked', 'desc'),
    };
    replaceNode(ctx.fileUri, node, sorted);
  };
  if (isTaskList) {
    return (
      <Block
        icons={<Icon type="sort-down" onClick={handleSort} />}
        className={className}
      >
        {ele}
      </Block>
    );
  }
  return ele;
}
