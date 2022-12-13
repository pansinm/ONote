import React from 'react';
import type { HTML } from 'mdast';
import { ErrorBoundary } from 'react-error-boundary';
import { escape, camelCase } from 'lodash';
import { resolveAssetUri } from './util/uri';
import { createLineClass } from './util/position';
import type { ICtx } from '../types';

// @see https://gist.github.com/goldhand/70de06a3bdbdb51565878ad1ee37e92b
function parseStyle(styles: string) {
  return styles
    .split(';')
    .filter((style) => style.split(':')[0] && style.split(':')[1])
    .map((style) => [
      style
        .split(':')[0]
        .trim()
        .replace(/-./g, (c) => c.substr(1).toUpperCase()),
      style.split(':').slice(1).join(':').trim(),
    ])
    .filter(([key]) => !['position', 'display'].includes(key))
    .reduce(
      (styleObj, style) => ({
        ...styleObj,
        [style[0]]: style[1],
      }),
      {},
    );
}
export function parseDom(text: string) {
  const dom = document.createElement('div');
  dom.innerHTML = text;
  const all = dom.querySelectorAll('*');
  all.forEach((node) => {
    node.getAttributeNames().forEach((name) => {
      if (/^on/.test(name)) {
        node.removeAttribute(name);
      }
    });
    if (node.tagName === 'SCRIPT') {
      node.replaceWith(escape(node.outerHTML));
    }
  });
  const children = dom.children;
  if (children.length === 1) {
    const node = dom.firstElementChild;
    if (node && node.tagName) {
      const tagName = node.tagName.toLocaleLowerCase();
      const isVoidEle = [
        'br',
        'hr',
        'img',
        'input',
        'link',
        'meta',
        'area',
        'base',
        'col',
        'command',
        'embed',
        'keygen',
        'param',
        'source',
        'track',
        'wbr',
      ].includes(tagName);

      return {
        tagName: node.tagName.toLocaleLowerCase(),
        props: node
          .getAttributeNames()
          .reduce<{ [key: string]: any }>((props, name) => {
            let camelCaseName = camelCase(name);
            if (camelCaseName === 'class') {
              camelCaseName = 'className';
            }
            props[camelCaseName] = node.getAttribute(name);
            if (name === 'style') {
              const val = props[camelCaseName];
              props.style = parseStyle(val);
            }
            return props;
          }, {}),
        innerHtml: isVoidEle ? undefined : node.innerHTML,
      };
    }
  }
  return {
    tagName: 'span',
    props: {},
    innerHtml: dom.innerHTML,
  };
}

/**
 * 渲染html，删除script及onxx属性
 * @param node
 * @param ctx
 */
export default function html(node: HTML, ctx: ICtx) {
  try {
    const { tagName, innerHtml, props } = parseDom(node.value);
    if (props.src) {
      props.src = resolveAssetUri(props.src, ctx);
    }
    const child = React.createElement(tagName, {
      className: createLineClass(node.position),
      ...props,
      dangerouslySetInnerHTML: innerHtml
        ? {
            __html: innerHtml,
          }
        : undefined,
    });
    return <ErrorBoundary fallback={<>{node.value}</>}>{child}</ErrorBoundary>;
  } catch (err) {
    console.error(err);
    return node.value;
  }
}
