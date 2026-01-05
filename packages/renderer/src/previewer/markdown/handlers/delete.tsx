import { createInlineHandler } from './util/handlerFactory';

/**
 * Delete（删除线）Handler
 *
 * 将 Markdown 的删除线文本渲染为 <del> 标签
 */
export default createInlineHandler('del');
