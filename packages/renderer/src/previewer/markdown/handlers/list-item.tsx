import React from 'react';
import type { ListItem } from 'mdast';
import { replaceNode } from '../../utils/md';
import classNames from 'classnames';
import { createLineClass } from './util/position';

const Wrap = (props: { children: React.ReactElement }) => {
  return props.children;
};

type CheckBoxProps = {
  checked?: boolean | null;
  visible?: boolean;
  onChange(): void;
};
const CheckBox = (props: CheckBoxProps) => {
  if (!props.visible) {
    return null;
  }
  return (
    <input
      type="checkbox"
      className="task-list-item-checkbox"
      checked={!!props.checked}
      onChange={props.onChange}
    ></input>
  );
};

export default function listItem(node: ListItem, ctx: any) {
  const isTask = typeof node.checked === 'boolean';
  const toggleCheckbox = () => {
    replaceNode(ctx.fileUri, node, {
      ...node,
      checked: !node.checked,
    });
  };
  return (
    <Wrap>
      <li
        className={classNames(
          {
            'task-list-item': isTask,
          },
          createLineClass(node.position),
        )}
      >
        <CheckBox
          visible={isTask}
          checked={node.checked}
          onChange={toggleCheckbox}
        />
        {node.children.map((n) => {
          /**
           * 如果li的子节点是paragraph，拍平
           */
          const ele = ctx.render(n, ctx);
          if (n.type === 'paragraph') {
            return <>{ele.props.children}</>;
          }
          return ele;
        })}
      </li>
    </Wrap>
  );
}
