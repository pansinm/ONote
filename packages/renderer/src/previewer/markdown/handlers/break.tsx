import { createVoidElementHandler } from './util/handlerFactory';

/**
 * Break（换行）Handler
 *
 * 将 Markdown 的换行符渲染为 <br> 标签
 */
export default createVoidElementHandler('br');
