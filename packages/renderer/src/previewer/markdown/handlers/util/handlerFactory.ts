/**
 * Markdown Handler 工厂函数
 *
 * 提供通用的 handler 创建函数，消除重复代码
 */

import type { ReactNode } from 'react';
import React from 'react';
import { createLineClass } from './position';
import type { Position } from 'unist';
import type { Root } from 'mdast';

/**
 * Markdown Handler 上下文类型
 */
export interface MarkdownHandlerContext {
  renderChildren: (node: Root, ctx: MarkdownHandlerContext) => ReactNode;
  // 可以根据需要添加更多属性
}

/**
 * 创建简单的内联元素 handler
 *
 * @param tagName - HTML 标签名（如 'em', 'strong', 'code'）
 * @param additionalClasses - 额外的 CSS 类名
 * @returns handler 函数
 *
 * @example
 * ```typescript
 * export default createInlineHandler('em');
 * // 或
 * export default createInlineHandler('strong', ['custom-class']);
 * ```
 */
export function createInlineHandler(
  tagName: string,
  additionalClasses: string[] = [],
) {
  return function(node: Root, ctx: any): ReactNode {
    const classes = [
      createLineClass(node.position),
      ...additionalClasses,
    ].filter(Boolean).join(' ');

    const props: Record<string, string> = classes ? { className: classes } : {};

    return React.createElement(
      tagName,
      classes ? props : null,
      ctx.renderChildren(node, ctx),
    );
  };
}

/**
 * 创建块级元素 handler
 *
 * @param tagName - HTML 标签名（如 'p', 'div', 'section'）
 * @param additionalClasses - 额外的 CSS 类名
 * @returns handler 函数
 *
 * @example
 * ```typescript
 * export default createBlockHandler('p');
 * ```
 */
export function createBlockHandler(
  tagName: string,
  additionalClasses: string[] = [],
) {
  return createInlineHandler(tagName, additionalClasses);
}

/**
 * 创建自闭合元素 handler
 *
 * @param tagName - HTML 标签名（如 'hr', 'br'）
 * @param additionalClasses - 额外的 CSS 类名
 * @returns handler 函数
 *
 * @example
 * ```typescript
 * export default createVoidElementHandler('hr');
 * ```
 */
export function createVoidElementHandler(
  tagName: string,
  additionalClasses: string[] = [],
) {
  return function(node: Root, ctx: any): ReactNode {
    const classes = [
      createLineClass(node.position),
      ...additionalClasses,
    ].filter(Boolean).join(' ');

    const props: Record<string, string> = classes ? { className: classes } : {};

    return React.createElement(tagName, classes ? props : null);
  };
}

/**
 * 创建带默认内容的 handler
 *
 * 当节点没有子元素时，使用默认内容
 *
 * @param tagName - HTML 标签名
 * @param defaultContent - 默认内容（通常是空字符串）
 * @param additionalClasses - 额外的 CSS 类名
 * @returns handler 函数
 *
 * @example
 * ```typescript
 * export default createHandlerWithDefault('td', '');
 * ```
 */
export function createHandlerWithDefault(
  tagName: string,
  defaultContent: string,
  additionalClasses: string[] = [],
) {
  return function(node: Root, ctx: any): ReactNode {
    const classes = [
      createLineClass(node.position),
      ...additionalClasses,
    ].filter(Boolean).join(' ');

    const props: Record<string, string> = classes ? { className: classes } : {};
    const content = node.children && node.children.length > 0
      ? ctx.renderChildren(node, ctx)
      : defaultContent;

    return React.createElement(tagName, classes ? props : null, content);
  };
}
