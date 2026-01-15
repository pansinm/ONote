/**
 * 类型系统验证测试
 *
 * 这个文件验证 IPC 类型系统是否正常工作
 */

import type { MessageData, MessageResponse } from '../types';
import { LLM_BOX_MESSAGE_TYPES } from '../../utils/constants';

// ============================================================================
// 类型安全验证
// ============================================================================

/**
 * 测试 AGENT_FILE_READ 消息的类型推断
 */
function testAgentFileRead() {
  // 数据类型应该是 { uri: string }
  type ReadData = MessageData<typeof LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ>;

  const data: ReadData = {
    uri: 'file:///test.md',
  };

  // ✅ 正确的类型
  console.log('File read data:', data);

  // @ts-expect-error - 缺少 uri 字段应该报错
  const invalidData1: ReadData = {};

  // @ts-expect-error - uri 应该是 string
  const invalidData2: ReadData = { uri: 123 };

  // 响应类型应该是 { content: string } | { error: string }
  type ReadResponse = MessageResponse<typeof LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ>;

  const response: ReadResponse = { content: 'test content' };
  const errorResponse: ReadResponse = { error: 'test error' };

  // @ts-expect-error - 不允许其他字段
  const invalidResponse: ReadResponse = { foo: 'bar' };
}

/**
 * 测试 AGENT_FILE_REPLACE 消息的复杂类型推断
 */
function testAgentFileReplace() {
  type ReplaceData = MessageData<typeof LLM_BOX_MESSAGE_TYPES.AGENT_FILE_REPLACE>;

  const data: ReplaceData = {
    uri: 'file:///test.md',
    operations: [
      {
        mode: 'string',
        search: 'foo',
        replace: 'bar',
        replaceAll: true,
        caseSensitive: false,
      },
      {
        mode: 'regex',
        search: 'test.*pattern',
        replace: 'replacement',
      },
      {
        mode: 'line_range',
        search: '',
        replace: 'new line',
        lineStart: 1,
        lineEnd: 10,
      },
    ],
    preview: true,
  };

  console.log('File replace data:', data);
}

/**
 * 测试类型推断的辅助函数
 */
function assertType<T>(_value: T) {
  // 这是一个类型断言辅助函数，用于测试
}

/**
 * 测试响应类型
 */
function testResponseTypes() {
  // AGENT_FILE_READ 的响应
  type ReadResponse = MessageResponse<typeof LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ>;

  const successResponse: ReadResponse = { content: 'file content' };
  assertType<{ content: string }>(successResponse);

  const errorResponse: ReadResponse = { error: 'error message' };
  assertType<{ error: string }>(errorResponse);

  // AGENT_FILE_WRITE 的响应
  type WriteResponse = MessageResponse<typeof LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE>;

  const writeSuccess: WriteResponse = { success: true };
  assertType<{ success: boolean }>(writeSuccess);

  const writeError: WriteResponse = { error: 'write failed' };
  assertType<{ error: string }>(writeError);
}

// ============================================================================
// 导出测试（确保编译通过）
// ============================================================================

export {
  testAgentFileRead,
  testAgentFileReplace,
  testResponseTypes,
};

console.log('✅ 类型系统测试编译通过！');
