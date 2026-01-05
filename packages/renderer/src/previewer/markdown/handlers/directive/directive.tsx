import type { Text } from 'mdast';
import React from 'react';
import type { ICtx } from '../../types';
import { createLineClass } from '../util/position';
import classNames from 'classnames';
import _ from 'lodash';
import { isVoidElement, parseStyle } from '../util/dom';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('DirectiveHandler');

const ALL_VALID_TAGS = [
  'section',
  'nav',
  'article',
  'aside',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'h1',
  'h6',
  'header',
  'footer',
  'address',
  'main',
  'p',
  'hr',
  'pre',
  'blockquote',
  'ol',
  'ul',
  'li',
  'dl',
  'dt',
  'dd',
  'dd',
  'figure',
  'figcaption',
  'div',
  'a',
  'em',
  'strong',
  'small',
  's',
  'cite',
  'q',
  'dfn',
  'abbr',
  'data',
  'time',
  'code',
  'var',
  'samp',
  'kbd',
  'sub',
  'sup',
  'i',
  'b',
  'u',
  'mark',
  'ruby',
  'rt',
  'rp',
  'bdi',
  'bdo',
  'span',
  'br',
  'wbr',
  'ins',
  'del',
  'img',
  'iframe',
  'embed',
  'object',
  'param',
  'object',
  'video',
  'audio',
  'source',
  'video',
  'audio',
  'track',
  'video',
  'audio',
  'canvas',
  'map',
  'area',
  'area',
  'map',
  'svg',
  'math',
  'table',
  'caption',
  'colgroup',
  'col',
  'tbody',
  'thead',
  'tfoot',
  'tr',
  'td',
  'th',
  'form',
  'font',
  'fieldset',
  'legend',
  'fieldset',
  'label',
  'input',
  'button',
  'select',
  'datalist',
  'optgroup',
  'option',
  'select',
  'datalist',
  'textarea',
  'keygen',
  'output',
  'progress',
  'meter',
  'details',
  'summary',
  'details',
  'menuitem',
  'menu',
];

export function parseDirectiveProps(node: any): Record<string, any> {
  const { class: className, style = '', ...rest } = node.attributes || {};
  const restPairs = Object.entries(rest).map(([key, val]) => [
    _.camelCase(key),
    val,
  ]);
  return {
    ..._.fromPairs(restPairs),
    className: classNames(className, createLineClass(node.position)),
    style: parseStyle(style),
  };
}

export function DefaultDirective({ node, ctx }: { node: any; ctx: ICtx }) {
  let Tag = node.type === 'textDirective' ? 'span' : 'div';
  Tag = ALL_VALID_TAGS.includes(node.name) ? node.name : Tag;
  const renderChild = node.children?.length && !isVoidElement(Tag);

  const props = parseDirectiveProps(node);
  if (Tag === 'mark') {
    (props as any).onClick = (event: MouseEvent) => {
      logger.debug('Mark directive clicked', { event, props });
      const id = _.get(props, 'id');
      if (!id) {
        return;
      }
      event.stopPropagation();
      document.dispatchEvent(
        new CustomEvent('open-comment-box', {
          detail: { id },
        }),
      );
    };
  }
  // eslint-disable-next-line react/no-children-prop
  return React.createElement(Tag, {
    ...props,
    children: renderChild ? ctx.renderChildren(node, ctx) : undefined,
  });
}
