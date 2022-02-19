import React from 'react';
import type { List, ListItem } from 'mdast';
import { renderChildren } from './render';
import Block from './components/Block';
import Icon from '/@/components/Icon';
import { replaceNode } from '../../utils/md';
import _ from 'lodash';
import classNames from 'classnames';


export default function list(node: List, ctx: any) {
  const List = node.ordered ? 'ol' : 'ul';
  const children = renderChildren(node, ctx);

  const isTaskList = node.children.find(
    (node) => typeof node.checked === 'boolean',
  );

  const className = classNames(
    `line-end-${node.position?.end.line} line-start-${node.position?.start.line}`,
    {
      'task-list-item': isTaskList,
    },
  );

  const ele = (
    <List>
      {children?.map((child, index) =>
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
