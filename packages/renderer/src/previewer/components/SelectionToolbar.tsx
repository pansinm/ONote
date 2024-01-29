import React from 'react';
import { useSelectionToolbarConfig } from '../hooks/useSelectionToolbarConfig';
import _ from 'lodash';
import type { IConProps } from '/@/components/Icon';
import Icon from '/@/components/Icon';

function findNodes(
  container: Node,
  indicator: (node: Node) => boolean,
): Node[] {
  const results: Node[] = [];
  if (indicator(container)) {
    return [container];
  }
  if (container.nodeType === document.ELEMENT_NODE) {
    results.push(
      ...[...container.childNodes]
        .map((node) => (indicator(node) ? node : findNodes(node, indicator)))
        .flat(),
    );
  }
  return results;
}

const getSelectedNodes = (
  selection: Selection,
  range: Range,
  container: Node,
) => {
  const nodes: Node[] = [];
  if (container.nodeType === document.TEXT_NODE) {
    nodes.push(container);
  }
  for (const node of container.childNodes) {
    if (!range.intersectsNode(node)) {
      continue;
    }
    if (selection.containsNode(node)) {
      nodes.push(node);
      continue;
    }
    nodes.push(...getSelectedNodes(selection, range, node));
  }

  return nodes
    .map((node) => {
      return findNodes(node, (node) => node.nodeType === document.TEXT_NODE);
    })
    .flat()
    .filter((text) => text.parentElement?.classList.contains('markdown-text'));
};

export function Toolbar() {
  const toolbarSetting = useSelectionToolbarConfig();

  const handleComment: IConProps['onMouseDown'] = (event) => {
    event.stopPropagation();
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const container = range?.commonAncestorContainer;
    if (!container || !selection) {
      return;
    }
    const nodes = getSelectedNodes(selection, range, container);
    const id = Math.random().toString(36).slice(2, 7);
    nodes.forEach((text) => {
      text.parentElement?.dispatchEvent(
        new CustomEvent('comment', {
          detail: {
            start:
              text === range.startContainer ? range.startOffset : undefined,
            end: text === range.endContainer ? range.endOffset : undefined,
            id,
          },
        }),
      );
    });
    if (nodes.length) {
      document.dispatchEvent(
        new CustomEvent('open-comment-box', { detail: { id } }),
      );
    }
    selection.collapseToEnd();
  };

  return (
    <div
      style={{
        display: toolbarSetting.shown ? 'block' : 'none',
        top: toolbarSetting.y + 5,
        left: toolbarSetting.x,
        background: '#fff',
        position: 'absolute',
      }}
    >
      <Icon
        type="chat-right-text"
        onMouseDown={handleComment}
        color="orange"
        style={{ rotate: '180deg' }}
      />
    </div>
  );
}
