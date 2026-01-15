import { Agent } from './Agent';

// ============================================================================
// Agent 单例实例
// ============================================================================
let agentInstance: Agent | null = null;

export function getAgent(): Agent {
  if (!agentInstance) {
    agentInstance = new Agent();
  }
  return agentInstance;
}

export function disposeAgent(): void {
  if (agentInstance) {
    agentInstance.dispose();
    agentInstance = null;
  }
}

export const agent = new Agent();

// ============================================================================
// 导出 Agent 类和工具
// ============================================================================
export { Agent } from './Agent';
export { ToolRegistry, createFileTools, createTodoTools } from './tools';
export type { TodoManager } from './tools';

// ============================================================================
// 从 prompts.ts 导出
// ============================================================================
export {
  SYSTEM_PROMPTS,
  renderSystemPrompt,
  getDirectoryFromUri,
} from './prompts';
export type { SystemPromptContext } from './prompts';
