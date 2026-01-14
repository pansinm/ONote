import type { AgentConfig, Message } from '../core/types';
import type { TodoManager } from './tools/todo-manager';
import { DEFAULT_CONFIG } from '../core/config';
import { SYSTEM_PROMPTS, renderSystemPrompt, type SystemPromptContext } from './prompts';

export interface AgentStrategy {
  buildSystemPrompt(
    config: AgentConfig,
    tools: { name: string; description: string }[],
    context?: SystemPromptContext
  ): string;
  shouldCompress(messages: Message[], contextWindowSize: number): boolean;
  shouldContinue(todoManager: TodoManager): boolean;
}

export class DefaultAgentStrategy implements AgentStrategy {
  private promptTemplate: string = SYSTEM_PROMPTS.base;

  setPromptTemplate(template: 'base' | 'developer' | 'writer'): void {
    this.promptTemplate = SYSTEM_PROMPTS[template] || SYSTEM_PROMPTS.base;
  }

  buildSystemPrompt(
    config: AgentConfig,
    tools: { name: string; description: string }[],
    context?: SystemPromptContext
  ): string {
    const toolDescriptions = tools
      .filter((t) => t.name !== 'listTodos')
      .map((t) => `  - ${t.name}: ${t.description}`)
      .join('\n');

    return renderSystemPrompt(this.promptTemplate, {
      currentTime: new Date().toLocaleString('zh-CN'),
      fileUri: config.fileUri,
      rootUri: config.rootUri,
      toolDescriptions,
      maxIterations: config.maxIterations || 50,
    });
  }

  shouldCompress(messages: Message[], contextWindowSize: number = DEFAULT_CONFIG.agent.contextWindow): boolean {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 3);
    const threshold = contextWindowSize * 0.8;

    return estimatedTokens >= threshold;
  }

  shouldContinue(todoManager: TodoManager): boolean {
    const todos = todoManager.listTodos();
    return todos.length > 0 && !todoManager.isAllCompleted();
  }
}

export class CustomAgentStrategy implements AgentStrategy {
  private customPrompt: string;
  private customContinueCondition: (todos: { length: number; isAllCompleted: () => boolean }) => boolean;
  private customCompressThreshold: number;

  constructor(options?: {
    customPrompt?: string;
    customContinueCondition?: (todos: { length: number; isAllCompleted: () => boolean }) => boolean;
    customCompressThreshold?: number;
  }) {
    this.customPrompt = options?.customPrompt ?? '';
    this.customContinueCondition = options?.customContinueCondition ?? ((todos) => todos.length > 0 && !todos.isAllCompleted());
    this.customCompressThreshold = options?.customCompressThreshold ?? 0.8;
  }

  buildSystemPrompt(
    config: AgentConfig,
    tools: { name: string; description: string }[],
    context?: SystemPromptContext
  ): string {
    if (this.customPrompt) {
      const toolDescriptions = tools
        .filter((t) => t.name !== 'listTodos')
        .map((t) => `  - ${t.name}: ${t.description}`)
        .join('\n');

      return renderSystemPrompt(this.customPrompt, {
        currentTime: new Date().toLocaleString('zh-CN'),
        fileUri: config.fileUri,
        rootUri: config.rootUri,
        toolDescriptions,
        maxIterations: config.maxIterations || 50,
      });
    }
    const defaultStrategy = new DefaultAgentStrategy();
    return defaultStrategy.buildSystemPrompt(config, tools, context);
  }

  shouldCompress(messages: Message[], contextWindowSize: number = DEFAULT_CONFIG.agent.contextWindow): boolean {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 3);
    const threshold = contextWindowSize * this.customCompressThreshold;

    return estimatedTokens >= threshold;
  }

  shouldContinue(todoManager: TodoManager): boolean {
    const todos = { length: todoManager.listTodos().length, isAllCompleted: () => todoManager.isAllCompleted() };
    return this.customContinueCondition(todos);
  }
}
