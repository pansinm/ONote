import { makeAutoObservable, runInAction } from 'mobx';
import type { Tool, ExecutionStep, AgentConfig } from './agent/types';
import ToolRegistry from './agent/ToolRegistry';
import { AgentOrchestrator } from './agent/AgentOrchestrator';
import { getLogger } from '../shared/logger';

const logger = getLogger('AgentStore');

export class AgentStore {
  // ========== 状态 ==========

  /** 工具列表 */
  tools: Tool[] = [];

  /** 执行日志 */
  executionLog: ExecutionStep[] = [];

  /** Agent 状态 */
  agentState: 'idle' | 'thinking' | 'executing' = 'idle';

  /** 错误信息 */
  error: string | null = null;

  /** 是否正在运行 */
  isRunning: boolean = false;

  /** 当前文件 URI */
  fileUri: string | null = null;

  /** 当前文件内容 */
  content: string = '';

  /** 选中的内容 */
  selection: string = '';
  
  // ========== 私有属性 ==========
  
  private config: AgentConfig;
  private channel: any;
  private toolRegistry: ToolRegistry;
  private orchestrator: AgentOrchestrator;

  constructor(config: AgentConfig, channel: any) {
    this.config = config;
    this.channel = channel;
    this.toolRegistry = new ToolRegistry(channel);
    this.orchestrator = new AgentOrchestrator({
      config,
      toolRegistry: this.toolRegistry,
      onStep: this.addStep.bind(this),
      onStateChange: (state) => {
        runInAction(() => {
          this.agentState = state;
        });
      },
    });

    makeAutoObservable(this);
    this.loadTools();
  }

  // ========== 公共方法 ==========
  
  /**
   * 加载工具列表
   */
  loadTools(): void {
    const tools = this.toolRegistry.getAll();
    runInAction(() => {
      this.tools = tools;
    });
    logger.info('Tools loaded', { count: tools.length });
  }

  /**
   * 更新文件信息
   */
  updateFileUri(fileUri: string): void {
    runInAction(() => {
      this.fileUri = fileUri;
    });
  }

  /**
   * 更新编辑器内容和选中内容
   */
  updateEditorContent(content: string, selection: string): void {
    runInAction(() => {
      this.content = content;
      this.selection = selection;
    });
  }

  /**
   * 运行 Agent
   */
  async runAgent(prompt: string): Promise<void> {
    runInAction(() => {
      this.isRunning = true;
      this.executionLog = [];
      this.error = null;
      this.agentState = 'thinking';
    });

    try {
      let enhancedPrompt = prompt;

      if (this.fileUri || this.selection) {
        enhancedPrompt = this.buildContextPrompt(prompt);
      }

      await this.orchestrator.run(enhancedPrompt);

      runInAction(() => {
        this.isRunning = false;
        this.agentState = 'idle';
      });

      logger.info('Agent execution completed', {
        steps: this.executionLog.length,
      });
    } catch (error) {
      runInAction(() => {
        this.isRunning = false;
        this.agentState = 'idle';
        this.error = error instanceof Error ? error.message : 'Unknown error';
      });
      logger.error('Agent execution failed', error);
      throw error;
    }
  }

  /**
   * 构建带上下文的提示词
   */
  private buildContextPrompt(userPrompt: string): string {
    const contextParts: string[] = [];

    if (this.fileUri) {
      contextParts.push(`File: ${this.fileUri}`);
    }

    if (this.selection) {
      contextParts.push(`Selected Content:\n${this.selection}`);
    } else if (this.content) {
      contextParts.push(`File Content:\n${this.content}`);
    }

    if (contextParts.length > 0) {
      return `${contextParts.join('\n\n')}\n\nTask:\n${userPrompt}`;
    }

    return userPrompt;
  }

  /**
   * 停止 Agent
   */
  stopAgent(): void {
    this.orchestrator.stop();
    runInAction(() => {
      this.isRunning = false;
      this.agentState = 'idle';
    });
  }

  /**
   * 清除执行日志
   */
  clearLog(): void {
    runInAction(() => {
      this.executionLog = [];
      this.error = null;
    });
  }

  /**
   * 保存 Agent 上下文
   */
  async saveContext(context: any): Promise<void> {
    try {
      await this.channel.send({
        type: 'AGENT_CONTEXT_SAVE',
        data: context,
      });
      logger.info('Agent context saved');
    } catch (error) {
      logger.error('Failed to save agent context', error);
    }
  }

  /**
   * 加载 Agent 上下文
   */
  async loadContext(fileUri: string): Promise<any> {
    try {
      const response = await this.channel.send({
        type: 'AGENT_CONTEXT_LOAD',
        data: { fileUri },
      }) as { error?: string; context?: any };

      if (response.error) {
        logger.error('Failed to load agent context', response.error);
        return null;
      }

      return response.context || null;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  // ========== 私有方法 ==========
  
  /**
   * 添加执行步骤
   */
  private addStep(step: ExecutionStep): void {
    runInAction(() => {
      this.executionLog.push(step);
    });
  }
}
