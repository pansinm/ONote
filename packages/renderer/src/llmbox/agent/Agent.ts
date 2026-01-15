import type { Message } from '../types';
import type { ToolCallResult } from '../core/api/client';
import { LLMClient } from '../core/api/client';
import { store } from '../store';
import { ToolRegistry, TodoManager } from './tools';
import { getLogger } from '/@/shared/logger';
import { uuid } from '/@/common/tunnel/utils';
import { throttle } from 'lodash';
import {
  SYSTEM_PROMPTS,
  renderSystemPrompt,
  type SystemPromptContext,
} from './prompts';
import { DEFAULT_CONFIG } from '../types';

const logger = getLogger('Agent');

const THROTTLE_DELAY = 50;

type ExecutionDecision =
  | { type: 'continue'; toolCalls: ToolCallResult[] }
  | { type: 'complete'; answer: string }
  | { type: 'stop' };

interface LLMResult {
  content: string;
  toolCalls: ToolCallResult[];
}

interface RunOptions {
  clearTodos?: boolean;
  clearLog?: boolean;
}

export class Agent {
  private toolRegistry: ToolRegistry;
  private todoManager: TodoManager;
  private llmClient: LLMClient;
  private abortController: AbortController | null = null;
  private currentIteration = 0;
  private thinkingContent = '';
  private promptTemplate: string = SYSTEM_PROMPTS.base;
  private currentThinkingStepId: string | null = null;
  private throttledUpdateThinking:
    | (((stepId: string, content: string) => void) & { cancel?: () => void })
    | null = null;

  constructor() {
    this.todoManager = new TodoManager();
    this.toolRegistry = new ToolRegistry(this.todoManager);
    this.llmClient = new LLMClient(store.getConfig());

    store.loadTools();
    const tools = this.toolRegistry.getAll();
    (store as any).tools = tools;

    this.todoManager.onChange((todos) => {
      store.setTodos(todos);
    });

    this.throttledUpdateThinking = throttle(
      (stepId: string, content: string) => {
        store.updateThinkingStepContent(stepId, content);
      },
      THROTTLE_DELAY,
    );
  }

  dispose(): void {
    if (
      this.throttledUpdateThinking &&
      'cancel' in this.throttledUpdateThinking
    ) {
      (this.throttledUpdateThinking as any).cancel();
    }
    this.throttledUpdateThinking = null;
  }

  setPromptTemplate(template: 'base' | 'developer' | 'writer'): void {
    this.promptTemplate = SYSTEM_PROMPTS[template] || SYSTEM_PROMPTS.base;
  }

  async run(prompt: string, options?: RunOptions): Promise<void> {
    if (store.isRunning) {
      logger.warn('Agent is already running, ignoring new request');
      return;
    }

    await this.initializeExecution(prompt, options);
    await this.runExecutionLoop();
  }

  private async initializeExecution(
    prompt: string,
    options?: RunOptions,
  ): Promise<void> {
    store.setRunning(true);
    store.setError(null);

    if (options?.clearLog !== false) {
      store.clearLog();
    }

    store.addMessage({
      role: 'user',
      content: prompt,
    });

    if (options?.clearTodos !== false) {
      this.todoManager.clear();
    }

    this.abortController = new AbortController();
    this.currentIteration = 0;
    this.thinkingContent = '';

    store.setAgentState('thinking');
    store.addStep({
      type: 'thinking',
      content: `Starting task: ${prompt}`,
    });
  }

  private buildContext(): SystemPromptContext {
    const config = store.getConfig();
    return {
      fileUri: config.fileUri,
      rootUri: config.rootUri,
    };
  }

  private getMaxIterations(): number {
    const config = store.getConfig();
    return config.maxIterations || 50;
  }

  stop(): void {
    logger.info('Stopping agent');
    this.dispose();
    if (this.abortController) {
      this.abortController.abort();
      store.addStep({
        type: 'thinking',
        content: 'Agent stopped by user',
      });
      store.setAgentState('idle');
      store.setRunning(false); // 重置运行状态，使输入框恢复可用
    }
  }

  async resume(): Promise<void> {
    if (store.isRunning) {
      logger.warn('Cannot resume execution: agent is already running');
      return;
    }

    const state = await store.fetchExecutionState();
    if (!state) {
      throw new Error('No saved execution state found');
    }

    try {
      store.setRunning(true);
      store.setError(null);

      this.abortController = new AbortController();
      this.currentIteration = state.iteration;
      this.thinkingContent = '';

      await this.runExecutionLoop();
    } catch (error) {
      store.setRunning(false);
      store.setAgentState('idle');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      store.setError(errorMessage);
      logger.error('Agent execution resume failed', error);
      throw error;
    }
  }

  private async runExecutionLoop(): Promise<void> {
    const maxIterations = this.getMaxIterations();
    const context = this.buildContext();
    const messages = this.buildMessages(store.conversationHistory, context);

    while (
      this.currentIteration < maxIterations &&
      !this.abortController?.signal.aborted
    ) {
      this.currentIteration++;
      this.resetThinkingState();

      if (this.shouldCompress(messages)) {
        this.compressMessages(messages);
      }

      const stepId = uuid('thinking-');
      this.currentThinkingStepId = stepId;

      const result = await this.think(messages, stepId);
      const assistantMessage = this.createAssistantMessage(result);
      messages.push(assistantMessage);

      const decision = this.evaluateResult(result);
      await this.handleDecision(decision, messages, stepId);
    }

    await this.cleanup();
  }

  private resetThinkingState(): void {
    store.setAgentState('thinking');
    this.currentThinkingStepId = null;
    this.thinkingContent = '';
  }

  private shouldCompress(messages: Message[]): boolean {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 3);
    const config = store.getConfig();
    const threshold =
      (config.contextWindowSize ?? DEFAULT_CONFIG.agent.contextWindow) * 0.8;

    return estimatedTokens >= threshold;
  }

  private compressMessages(messages: Message[]): void {
    messages.push({
      id: uuid('sys-'),
      role: 'system',
      content: '[Summary of previous conversation]',
      timestamp: Date.now(),
    });
  }

  private async think(messages: Message[], stepId: string): Promise<LLMResult> {
    const tools = this.toolRegistry.getAll();

    let content = '';
    const toolCallsMap = new Map<string, ToolCallResult>();

    for await (const chunk of this.llmClient.stream(messages, {
      signal: this.abortController!.signal,
      tools,
    })) {
      if (chunk.content) {
        content += chunk.content;
        this.throttledUpdateThinking?.(stepId, content);
      }

      for (const tc of chunk.toolCalls) {
        if (!toolCallsMap.has(tc.id)) {
          toolCallsMap.set(tc.id, {
            id: tc.id,
            name: tc.name || '',
            arguments: tc.arguments || '',
            content: '',
          });
        } else {
          const existing = toolCallsMap.get(tc.id)!;
          if (tc.name && !existing.name) {
            existing.name = tc.name;
          }
          if (tc.arguments) {
            existing.arguments += tc.arguments;
          }
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values()).filter((tc) => tc.name);

    return { content, toolCalls };
  }

  private createAssistantMessage(result: LLMResult): Message {
    return {
      id: uuid('assistant-'),
      role: 'assistant',
      content: result.content,
      timestamp: Date.now(),
    };
  }

  private evaluateResult(result: LLMResult): ExecutionDecision {
    if (result.toolCalls.length > 0) {
      return { type: 'continue', toolCalls: result.toolCalls };
    }

    if (!this.shouldContinue()) {
      return { type: 'complete', answer: result.content };
    }

    return { type: 'stop' };
  }

  private shouldContinue(): boolean {
    const todos = this.todoManager.listTodos();
    return todos.length > 0 && !this.todoManager.isAllCompleted();
  }

  private async handleDecision(
    decision: ExecutionDecision,
    messages: Message[],
    stepId: string,
  ): Promise<void> {
    switch (decision.type) {
      case 'continue':
        await this.executeToolCalls(decision.toolCalls, messages);
        break;

      case 'complete':
        store.addStep({
          type: 'thinking',
          content: decision.answer,
        });
        store.addStep({
          type: 'final_answer',
          content: decision.answer,
        });
        break;

      case 'stop':
        break;
    }
  }

  private async executeToolCalls(
    toolCalls: ToolCallResult[],
    messages: Message[],
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      await this.executeToolCall(toolCall, messages);
    }
  }

  private async executeToolCall(
    toolCall: ToolCallResult,
    messages: Message[],
  ): Promise<void> {
    const startTime = Date.now();
    store.setAgentState('executing');

    const validationResult = this.validateToolCall(toolCall);
    if (!validationResult.valid) {
      this.sendErrorResponse(
        toolCall,
        validationResult.error!,
        messages,
        startTime,
      );
      return;
    }

    const tool = this.toolRegistry.get(toolCall.name)!;
    const params = this.parseArguments(toolCall.arguments);

    this.logToolExecution(toolCall, params);
    this.recordToolCall(toolCall, params, startTime);

    const result = await this.executeTool(
      tool,
      params,
      toolCall,
      messages,
      startTime,
    );
    this.sendToolResult(toolCall, result, messages, startTime);
  }

  private validateToolCall(toolCall: ToolCallResult): {
    valid: boolean;
    error?: string;
  } {
    if (!toolCall.name) {
      return { valid: false, error: 'No tool name provided' };
    }

    const tool = this.toolRegistry.get(toolCall.name);
    if (!tool) {
      return { valid: false, error: `Tool "${toolCall.name}" not found` };
    }

    try {
      this.parseArguments(toolCall.arguments);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid arguments format' };
    }
  }

  private sendErrorResponse(
    toolCall: ToolCallResult,
    error: string,
    messages: Message[],
    startTime: number,
  ): void {
    store.addStep({
      type: 'error',
      message: error,
      recoverable: error.includes('not found'),
    });

    store.addStep({
      type: 'tool_call',
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      params: this.parseArguments(toolCall.arguments),
      duration: Date.now() - startTime,
    });

    messages.push({
      id: uuid('tool-'),
      role: 'tool',
      content: `Error: ${error}`,
      toolCallId: toolCall.id,
      timestamp: Date.now(),
    });
  }

  private logToolExecution(
    toolCall: ToolCallResult,
    params: Record<string, unknown>,
  ): void {
    logger.info('Executing tool', {
      toolName: toolCall.name,
      params: JSON.stringify(params, null, 2),
    });
  }

  private recordToolCall(
    toolCall: ToolCallResult,
    params: Record<string, unknown>,
    startTime: number,
  ): void {
    store.addStep({
      type: 'tool_call',
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      params,
      duration: Date.now() - startTime,
    });
  }

  private async executeTool(
    tool: NonNullable<ReturnType<typeof this.toolRegistry.get>>,
    params: Record<string, unknown>,
    toolCall: ToolCallResult,
    messages: Message[],
    startTime: number,
  ): Promise<unknown> {
    try {
      return await tool.executor(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      store.addStep({
        type: 'tool_result',
        toolCallId: toolCall.id,
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      });

      messages.push({
        id: uuid('tool-'),
        role: 'tool',
        content: `Error: ${errorMessage}`,
        toolCallId: toolCall.id,
        toolName: tool.name,
        error: errorMessage,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private sendToolResult(
    toolCall: ToolCallResult,
    result: unknown,
    messages: Message[],
    startTime: number,
  ): void {
    const resultContent =
      typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    store.addStep({
      type: 'tool_result',
      toolCallId: toolCall.id,
      success: true,
      result,
      duration: Date.now() - startTime,
    });

    messages.push({
      id: uuid('tool-'),
      role: 'tool',
      content: resultContent,
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      result,
      timestamp: Date.now(),
    });

    logger.info('Tool executed', {
      toolName: toolCall.name,
      result: typeof result === 'string' ? result : 'JSON result',
      duration: Date.now() - startTime,
    });
  }

  private async cleanup(): Promise<void> {
    store.setRunning(false);
    store.setAgentState('idle');

    logger.info('Agent execution completed', {
      steps: store.steps.length,
      messages: store.conversationHistory.length,
    });
  }

  private buildMessages(
    history: Message[],
    context: SystemPromptContext,
  ): Message[] {
    const tools = this.toolRegistry
      .getAll()
      .filter((t) => t.name !== 'listTodos')
      .map((t) => ({ name: t.name, description: t.description }));

    const systemPrompt = this.buildSystemPrompt(tools, context);

    const systemMessage: Message = {
      id: uuid('sys-'),
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now(),
    };

    const userMessages = history.filter((m) => m.role !== 'tool');

    return [systemMessage, ...userMessages];
  }

  private buildSystemPrompt(
    tools: { name: string; description: string }[],
    context?: SystemPromptContext,
  ): string {
    const toolDescriptions = tools
      .map((t) => `  - ${t.name}: ${t.description}`)
      .join('\n');

    const config = store.getConfig();
    return renderSystemPrompt(this.promptTemplate, {
      currentTime: new Date().toLocaleString('zh-CN'),
      fileUri: context?.fileUri,
      rootUri: context?.rootUri,
      toolDescriptions,
      maxIterations: config.maxIterations || 50,
    });
  }

  private parseArguments(args: string): Record<string, unknown> {
    if (!args.trim()) return {};
    try {
      return JSON.parse(args);
    } catch {
      return { _raw: args };
    }
  }
}

export default Agent;
