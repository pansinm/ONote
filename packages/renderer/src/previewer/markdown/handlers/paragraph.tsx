import type { ReactNode } from 'react';
import React from 'react';
import type { Heading, Paragraph, Root, Text } from 'mdast';
import { render, renderChildren } from './render';
import { parseDom } from './html';
import type { Node } from 'unist';
import { createLineClass } from './util/position';
import { stringify } from '../../utils/md';

const voidElements = [
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'nextid',
  'param',
  'source',
  'track',
  'wbr',
];

function tagType(value: string) {
  if (/^<\//.test(value)) {
    return 'end';
  }
  return 'start';
}

function parseEndTagName(value: string) {
  return value.replace(/<\/|>|\s/g, '');
}

function renderToc(root: Root, node: Node) {
  const headings = root.children.filter(
    (node) => node.type === 'heading',
  ) as Heading[];
  return (
    <ul className={`toc ${createLineClass(node.position)}`}>
      {headings.map((heading, index) => {
        const title = stringify(heading as any)
          .trim()
          .slice(heading.depth + 1);
        return (
          <li key={index} style={{ marginLeft: 20 * heading.depth }}>
            <a
              href={`#${encodeURIComponent(title)}`}
              onClick={(event) => {
                event.preventDefault();
                const ele = document.getElementById(encodeURIComponent(title));
                // 触发滚动事件时，不能拿到滚动后的scrollTop，手动触发下事件
                ele?.scrollIntoView();
              }}
            >
              {title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function paragraph(node: Paragraph, ctx: any) {
  if (
    node.children.length === 1 &&
    /^\[toc\]$/i.test((node.children[0] as Text)?.value as string)
  ) {
    return renderToc(ctx.getRootNode(), node);
  }
  const containHtml = node.children.find((n) => n.type === 'html');

  /**
   * 行内的html只会解析tag，需要单独处理
   */
  if (containHtml) {
    console.log('paragraph', node);
    return (
      <p className={createLineClass(node.position)}>
        {renderHtml([...node.children], '', ctx)}
      </p>
    );
  }
  return (
    <p className={createLineClass(node.position)}>
      {renderChildren(node, ctx)}
    </p>
  );
}

function renderHtml(nodes: Node[], tagName: string, ctx: any): ReactNode[] {
  const children = [];
  while (nodes.length) {
    const node = nodes.shift() as Node;
    if (node.type !== 'html') {
      children.push(render(node, ctx));
      continue;
    }
    const value = node.value as string;
    const type = tagType(value);
    if (type === 'start') {
      const dom = parseDom(value);
      if (voidElements.includes(dom.tagName)) {
        children.push(
          React.createElement(dom.tagName, {
            ...dom.props,
          }),
        );
        continue;
      }
      children.push(
        React.createElement(
          dom.tagName,
          {
            ...dom.props,
          },
          ...renderHtml(nodes, dom.tagName, ctx),
        ),
      );
      continue;
    }

    if (type === 'end' && parseEndTagName(value) === tagName) {
      return children;
    }
    children.push(render({ ...node, type: 'text' }, ctx));
  }
  return children;
}
