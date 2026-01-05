import { createInlineHandler } from './util/handlerFactory';

/**
 * Strong（粗体）Handler
 *
 * 将 Markdown 的粗体文本渲染为 <strong> 标签
 */
export default createInlineHandler('strong');
