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

  tools: Tool[] = [];

  executionLog: ExecutionStep[] = [];

  conversationHistory: AgentMessage[] = [];

  agentState: 'idle' | 'thinking' | 'executing' = 'idle';

  error: string | null = null;

  isRunning = false;

  fileUri: string | null = null;

  content = '';

  selection = '';

  maxConversationRounds = 50;

  compressThreshold = 20;

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

  loadTools(): void {
    const tools = this.toolRegistry.getAll();
    runInAction(() => {
      this.tools = tools;
    });
    logger.info('Tools loaded', { count: tools.length });
  }

  updateFileUri(fileUri: string): void {
    runInAction(() => {
      this.fileUri = fileUri;
    });
  }

  updateRootUri(rootUri: string): void {
    runInAction(() => {
      this.config.rootUri = rootUri;
    });
  }

  updateEditorContent(content: string, selection: string): void {
    runInAction(() => {
      this.content = content;
      this.selection = selection;
    });
  }

  addMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    runInAction(() => {
      this.conversationHistory.push({
        ...message,
        id: uuid('agent-msg-'),
        timestamp: new Date(),
      });
    });
  }

  addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): void {
    const stepId = uuid('agent-step-');
    const stepWithId = {
      ...step,
      id: stepId,
      timestamp: new Date(),
    };

    logger.debug('Adding step to execution log', {
      id: stepId,
      type: step.type,
      currentCount: this.executionLog.length,
    });

    runInAction(() => {
      this.executionLog.push(stepWithId);
    });
  }

  clearLog(): void {
    runInAction(() => {
      this.executionLog = [];
    });
  }

  clearConversation(): void {
    runInAction(() => {
      this.conversationHistory = [];
    });
  }

  setError(error: string | null): void {
    runInAction(() => {
      this.error = error;
    });
  }

  setRunning(running: boolean): void {
    runInAction(() => {
      this.isRunning = running;
    });
  }

  clearError(): void {
    this.setError(null);
  }

  // ========== 公共方法 ==========

  stopAgent(): void {
    logger.info('Stopping agent');
    this.orchestrator.stop();
    this.setRunning(false);
  }

  // ========== 私有方法 ==========

  private getDirectoryFromUri(fileUri: string): string {
    const withoutProtocol = fileUri.replace('file://', '');
    const lastSlashIndex = withoutProtocol.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return withoutProtocol;
    }
    return withoutProtocol.substring(0, lastSlashIndex);
  }

  private buildContextPrompt(
    fileUri: string,
    userPrompt: string,
    hasContext: boolean,
  ): string {
    const parts: string[] = [];

    parts.push('## Context');

    if (fileUri) {
      const workingDir = this.getDirectoryFromUri(fileUri);
      parts.push(`Working Directory: ${workingDir}`);
      parts.push(`Current File: ${fileUri}`);
    }

    if (this.selection) {
      parts.push(`Selected Content:\n\`\`\`\n${this.selection}\n\`\`\``);
    }

    if (this.content) {
      parts.push(`Current File Content:\n\`\`\`\n${this.content}\n\`\`\``);
    }

    parts.push('## Task');
    parts.push(userPrompt);

    if (hasContext) {
      parts.push(
        `\n## Previous Context\nTasks: ${this.executionLog.length}, Messages: ${this.conversationHistory.length}`,
      );
    }

    return `${parts.join('\n')}\n\n`;
  }

  async runAgent(prompt: string): Promise<void> {
    if (this.isRunning) {
      logger.warn('Agent is already running, ignoring new request');
      return;
    }

    try {
      this.setRunning(true);
      this.clearError();
      this.clearLog();

      await this.compressConversation();

      const userPrompt = this.buildContextPrompt(
        this.fileUri || '',
        prompt,
        !!this.fileUri,
      );

      const conversationHistory = this.conversationHistory
        .filter((msg: any) => {
          return (
            msg.role === 'user' ||
            msg.role === 'assistant' ||
            msg.role === 'system'
          );
        })
        .map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));

      await this.orchestrator.run(userPrompt, conversationHistory);
      this.setRunning(false);
      logger.info('Agent execution completed', {
        steps: this.executionLog.length,
        messages: this.conversationHistory.length,
      });
    } catch (error) {
      this.setRunning(false);
      this.setError(error instanceof Error ? error.message : 'Unknown error');
      logger.error('Agent execution failed', error);
      throw error;
    }
  }

  async compressConversation(): Promise<void> {
    if (this.conversationHistory.length === 0) {
      return;
    }

    const messagesToCompress = this.conversationHistory.filter((msg: any) => {
      return (
        msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system'
      );
    });

    if (messagesToCompress.length <= this.compressThreshold) {
      return;
    }

    const messagesToKeep = messagesToCompress.slice(-this.compressThreshold);
    const messagesToCompressSummary = messagesToCompress.slice(
      0,
      messagesToCompress.length - this.compressThreshold,
    );

    if (messagesToCompressSummary.length === 0) {
      return;
    }

    const conversationText = messagesToCompressSummary
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const summaryPrompt = `请用中文简洁总结以下对话内容，2-3 句话即可：\n\n${conversationText}`;

    try {
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
              content: summaryPrompt,
            },
            ...messagesToCompressSummary,
            {
              role: 'user',
              content: `Please summarize these conversations in 2-3 sentences in Chinese:\n\n${conversationText}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const summary = data.choices[0]?.message?.content;

      const summaryMessage: AgentMessage = {
        id: uuid('agent-summary-'),
        role: 'system',
        content: `[Summary of previous conversation]: ${summary}`,
        timestamp: new Date(),
      };

      this.conversationHistory = [summaryMessage, ...messagesToKeep];

      logger.info('Conversation compressed', {
        originalCount: messagesToCompress.length,
        compressedCount: messagesToCompressSummary.length,
        remainingCount: 1 + messagesToKeep.length,
      });
    } catch (error) {
      logger.error('Failed to compress conversation', error);
    }
  }

  async saveContext(fileUri: string): Promise<void> {
    try {
      const contextToSave = {
        fileUri,
        executionLog: this.executionLog,
        conversationHistory: this.conversationHistory,
        error: this.error,
        content: this.content,
        selection: this.selection,
      };

      const response = await this.channel.send({
        type: 'AGENT_CONTEXT_SAVE',
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          context: contextToSave,
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      logger.info('Agent context saved', {
        fileUri,
        stepCount: this.executionLog.length,
        messageCount: this.conversationHistory.length,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error);
    }
  }

  async loadContext(fileUri: string): Promise<any> {
    try {
      const response = (await this.channel.send({
        type: 'AGENT_CONTEXT_LOAD',
        data: { fileUri },
      })) as { error?: string; agentContext?: any };

      if (response.error) {
        logger.error('Failed to load agent context', response.error);
        return null;
      }

      const agentContext = response.agentContext;

      runInAction(() => {
        // 设置当前文件的 fileUri（不从上下文中加载）
        this.fileUri = fileUri;

        if (!agentContext) {
          logger.debug(
            'No agentContext found for file, resetting conversation and execution data',
            { fileUri },
          );

          this.error = null;
          this.selection = '';
          this.executionLog = [];
          this.conversationHistory = [];
        } else {
          this.error = agentContext.error || null;
          this.selection = agentContext.selection || '';
          this.executionLog = agentContext.executionLog || [];
          this.conversationHistory = agentContext.conversationHistory || [];
        }
      });

      logger.info('Agent context loaded', {
        fileUri: this.fileUri,
        hasContext: !!agentContext,
        executionLogCount: agentContext.executionLog?.length || 0,
        conversationCount: agentContext.conversationHistory?.length || 0,
      });

      return agentContext;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  isConversationHistoryEmpty(): boolean {
    return this.conversationHistory.length === 0;
  }

  isExecutionLogEmpty(): boolean {
    return this.executionLog.length === 0;
  }
}

export default AgentStore;
