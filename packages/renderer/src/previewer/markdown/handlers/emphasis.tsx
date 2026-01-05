import { createInlineHandler } from './util/handlerFactory';

/**
 * Emphasis（斜体）Handler
 *
 * 将 Markdown 的斜体文本渲染为 <em> 标签
 */
export default createInlineHandler('em');
