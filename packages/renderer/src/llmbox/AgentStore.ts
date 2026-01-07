import { makeAutoObservable, runInAction, toJS } from 'mobx';
import type { Tool, ExecutionStep, AgentConfig } from './agent/types';
import ToolRegistry from './agent/ToolRegistry';
import { AgentOrchestrator } from './agent/AgentOrchestrator';
import { getLogger } from '../shared/logger';
import { uuid } from '../common/tunnel/utils';

const logger = getLogger('AgentStore');

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
}

export class AgentStore {
  // ========== 状态 ==========

  /** 工具列表 */
  tools: Tool[] = [];

  /** 执行日志 */
  executionLog: ExecutionStep[] = [];

  /** 对话历史 */
  conversationHistory: AgentMessage[] = [];

  /** Agent 状态 */
  agentState: 'idle' | 'thinking' | 'executing' = 'idle';

  /** 错误信息 */
  error: string | null = null;

  /** 是否正在运行 */
  isRunning = false;

  /** 当前文件 URI */
  fileUri: string | null = null;

  /** 当前文件内容 */
  content = '';

  /** 选中的内容 */
  selection = '';

  /** 最大对话轮次，超过后进行压缩 */
  maxConversationRounds = 10;

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
      onMessage: (message) => {
        this.addMessage(message);
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
   * 更新根 URI
   */
  updateRootUri(rootUri: string): void {
    runInAction(() => {
      this.config.rootUri = rootUri;
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
   * 添加对话消息
   */
  addMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    const newMessage: AgentMessage = {
      ...message,
      id: uuid('agent-msg-'),
      timestamp: new Date(),
    };

    runInAction(() => {
      this.conversationHistory.push(newMessage);
    });

    logger.debug('Added agent message', { role: message.role, id: newMessage.id });
  }

  /**
   * 清空对话历史
   */
  clearConversation(): void {
    runInAction(() => {
      this.conversationHistory = [];
    });
    logger.info('Conversation history cleared');
  }

  /**
   * 压缩对话历史（使用 LLM summary）
   */
  async compressConversation(): Promise<void> {
    if (this.conversationHistory.length === 0) {
      return;
    }

    const messagesToCompress = this.conversationHistory.filter(
      msg => msg.role === 'user' || msg.role === 'assistant'
    );

    if (messagesToCompress.length <= this.maxConversationRounds * 2) {
      return;
    }

    logger.info('Compressing conversation', {
      messageCount: this.conversationHistory.length,
      rounds: messagesToCompress.length / 2,
    });

    try {
      const conversationText = messagesToCompress
        .slice(0, this.maxConversationRounds * 2)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');

      const summaryPrompt = `Please summarize the following conversation concisely in 2-3 sentences, focusing on the main topics and outcomes:\n\n${conversationText}`;

      const response = await fetch(this.config.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes conversations.',
            },
            {
              role: 'user',
              content: summaryPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content || 'Conversation summary';

      runInAction(() => {
        const summaryMessage: AgentMessage = {
          id: uuid('agent-summary-'),
          role: 'system',
          content: `[Summary of previous conversation]: ${summary}`,
          timestamp: new Date(),
        };

        this.conversationHistory = [
          summaryMessage,
          ...this.conversationHistory.slice(this.maxConversationRounds * 2),
        ];
      });

      logger.info('Conversation compressed', {
        originalCount: this.conversationHistory.length,
        newCount: 1 + this.conversationHistory.length - this.maxConversationRounds * 2,
      });
    } catch (error) {
      logger.error('Failed to compress conversation', error);
    }
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
      await this.compressConversation();

      this.addMessage({
        role: 'user',
        content: prompt,
      });

      let enhancedPrompt = prompt;

      if (this.fileUri || this.selection) {
        enhancedPrompt = this.buildContextPrompt(prompt);
      }

      const conversationHistory = this.conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      await this.orchestrator.run(enhancedPrompt, conversationHistory);

      runInAction(() => {
        this.isRunning = false;
        this.agentState = 'idle';
      });

      logger.info('Agent execution completed', {
        steps: this.executionLog.length,
        messageCount: this.conversationHistory.length,
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
  async saveContext(fileUri: string): Promise<void> {
    try {
      const context = {
        fileUri,
        executionLog: toJS(this.executionLog),
        conversationHistory: toJS(this.conversationHistory),
        error: this.error,
        content: this.content,
        selection: this.selection,
      };

      await this.channel.send({
        type: 'AGENT_CONTEXT_SAVE',
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          context,
        },
      });
      logger.info('Agent context saved', {
        fileUri,
        stepCount: this.executionLog.length,
        messageCount: this.conversationHistory.length,
      });
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

      const context = response.context;
      if (!context) {
        return null;
      }

      runInAction(() => {
        this.fileUri = context.fileUri || null;
        this.error = context.error || null;
        this.content = context.content || '';
        this.selection = context.selection || '';

        if (context.executionLog && Array.isArray(context.executionLog)) {
          this.executionLog = context.executionLog.map((step: any) => ({
            ...step,
            timestamp: step.timestamp ? new Date(step.timestamp) : new Date(),
          }));
        } else {
          this.executionLog = [];
        }

        if (context.conversationHistory && Array.isArray(context.conversationHistory)) {
          this.conversationHistory = context.conversationHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
        } else {
          this.conversationHistory = [];
        }
      });

      logger.info('Agent context loaded', {
        stepCount: context.executionLog?.length || 0,
        messageCount: context.conversationHistory?.length || 0,
      });

      return context;
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
