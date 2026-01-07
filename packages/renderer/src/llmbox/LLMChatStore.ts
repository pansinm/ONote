import { makeAutoObservable, runInAction, toJS } from 'mobx';
import type { Message, ChatState } from './types';
import { uuid } from '../common/tunnel/utils';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('LLMChatStore');

interface LLMChatStoreOptions {
  apiKey?: string;
  model?: string;
  apiBase?: string;
  fileUri?: string;
}

function buildSystemMessage(note: string, selection: string) {
  const prompt = `
你是一名专业的笔记助手，帮助用户优化和理解他们的笔记内容。

## 当前上下文

### 笔记全文
\`\`\`markdown
${note}
\`\`\`

### 选中内容
\`\`\`markdown
${selection}
\`\`\`

## 你的职责

1. **理解上下文**：结合笔记全文和选中内容，理解用户的真实意图
2. **精准响应**：只针对选中的内容进行操作，不要复述或总结全文
3. **保持一致**：确保你的回答与笔记的上下文和风格保持一致

## 输出要求

1. **简洁高效**：用最少的文字表达最多的信息，避免冗长的开场白和结束语
2. **结构清晰**：使用 Markdown 格式组织内容（标题、列表、代码块、表格等）
3. **格式正确**：代码块使用正确的语言标识符（如 \`\`\`javascript）
4. **逻辑严谨**：确保内容准确无误，不引入笔记上下文外的无关信息

## 常见任务参考

- **解释说明**：用通俗易懂的语言解释选中内容
- **总结提炼**：提炼核心要点，用要点列表呈现
- **扩写丰富**：基于上下文补充细节或案例
- **翻译语言**：翻译成目标语言，保持专业术语准确
- **修正改进**：指出错误并提供改进建议
- **结构优化**：重组内容结构，使其更清晰

## 注意事项

- 如果选中内容为空，请提示用户先选择内容
- 如果用户的需求不明确，可以提问澄清
- 不要编造笔记上下文外的信息
`.trim();

  return {
    role: 'system',
    content: prompt,
  };
}

export class LLMChatStore implements ChatState {
  messages: Message[] = [];
  isLoading = false;
  error: string | null = null;
  streamingMessageId?: string;
  note?: string;
  selection?: string;

  private options: LLMChatStoreOptions;
  private currentFileUri: string | undefined;
  private loadConversationFn: ((fileUri: string) => Promise<void>) | undefined;
  private saveConversationFn: ((fileUri: string, messages: Message[]) => Promise<void>) | undefined;

  constructor(options: LLMChatStoreOptions = {}) {
    this.options = options;
    this.currentFileUri = options.fileUri;
    makeAutoObservable(this);
  }

  updateOptions(options: LLMChatStoreOptions) {
    this.options = { ...this.options, ...options };
  }

  updateFileUri(fileUri: string) {
    console.log('[LLMChatStore] updateFileUri called:', fileUri);
    this.currentFileUri = fileUri;
  }

  setLoadConversation(fn: (fileUri: string) => Promise<void>) {
    this.loadConversationFn = fn;
  }

  setSaveConversation(fn: (fileUri: string, messages: Message[]) => Promise<void>) {
    this.saveConversationFn = fn;
  }

  setMessages(messages: Message[]) {
    runInAction(() => {
      this.messages = messages;
    });
  }

  addMessage(message: Omit<Message, 'id'>): string {
    const newMessage: Message = {
      ...message,
      id: uuid('message-'),
    };

    runInAction(() => {
      this.messages = [...this.messages, newMessage];
    });

    return newMessage.id;
  }

  updateStreamingMessage(messageId: string, content: string) {
    runInAction(() => {
      this.messages = this.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: msg.content + content, isStreaming: true }
          : msg,
      );
    });
  }

  updateEditorContent(content: string, selection: string) {
    runInAction(() => {
      this.note = content;
      this.selection = selection;
    });
  }

  completeStreamingMessage(messageId: string) {
    runInAction(() => {
      this.messages = this.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg,
      );
      this.streamingMessageId = undefined;
    });

    logger.debug('completeStreamingMessage called', {
      messageId,
      messageCount: this.messages.length,
      currentFileUri: this.currentFileUri,
    });

    this.saveConversation();
  }

  async loadConversation(): Promise<void> {
    if (!this.currentFileUri || !this.loadConversationFn) {
      logger.debug('No file URI or load function provided, skipping conversation load', {
        currentFileUri: this.currentFileUri,
        hasLoadFn: !!this.loadConversationFn,
      });
      return;
    }

    try {
      logger.info('Loading conversation', { fileUri: this.currentFileUri });
      await this.loadConversationFn(this.currentFileUri);
      logger.info('Conversation load requested');
    } catch (error) {
      logger.error('Failed to load conversation', error);
    }
  }

  async saveConversation(): Promise<void> {
    if (!this.currentFileUri || !this.saveConversationFn) {
      logger.debug('No file URI or save function provided, skipping conversation save', {
        currentFileUri: this.currentFileUri,
        hasSaveFn: !!this.saveConversationFn,
      });
      return;
    }

    try {
      logger.info('Saving conversation', {
        fileUri: this.currentFileUri,
        messageCount: this.messages.length,
      });
      await this.saveConversationFn(this.currentFileUri, toJS(this.messages));
      logger.info('Conversation save requested');
    } catch (error) {
      logger.error('Failed to save conversation', error);
    }
  }

  /**
   * 发送消息到 LLM 并处理流式响应
   * @param content - 用户消息内容
   * @param imageUrls - 可选的图片 URL 数组
   */
  sendMessage = async (content: string, imageUrls?: string[]) => {
    try {
      // 1. 验证请求
      this.validateRequest();

      // 2. 创建并添加用户消息
      const userMessage: Omit<Message, 'id'> = {
        content,
        role: 'user',
        timestamp: new Date(),
        imageUrls,
      };
      this.addMessage(userMessage);

      // 3. 更新状态
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
      });

      // 4. 创建助理消息占位符
      const assistantMessage: Omit<Message, 'id'> = {
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };
      const assistantMessageId = this.addMessage(assistantMessage);

      runInAction(() => {
        this.streamingMessageId = assistantMessageId;
      });

      // 5. 构建并发送请求
      const messages = this.buildRequestMessages(content, assistantMessageId);
      const response = await this.callLLMAPI(messages);

      // 6. 处理流式响应
      await this.processStreamResponse(response, assistantMessageId);

      // 7. 完成流式消息
      this.completeStreamingMessage(assistantMessageId);
    } catch (error) {
      // 8. 错误处理
      this.handleSendError(error);
    } finally {
      // 9. 清理状态
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  clearMessages() {
    runInAction(() => {
      this.messages = [];
      this.error = null;
      this.streamingMessageId = undefined;
    });
  }

  /**
   * 验证发送消息的前置条件
   * @throws {Error} 当 API Key 未配置时抛出错误
   */
  private validateRequest(): void {
    if (!this.options.apiKey) {
      runInAction(() => {
        this.error = 'API密钥未配置';
      });
      throw new Error('API密钥未配置');
    }
  }

  /**
   * 构建要发送给 LLM 的消息数组
   * @param content - 用户消息内容
   * @param assistantMessageId - 助理消息 ID（需要过滤掉）
   * @returns 消息数组
   */
  private buildRequestMessages(
    content: string,
    assistantMessageId: string
  ): Array<{ role: string; content: string }> {
    const messages = [
      buildSystemMessage(this.note || '', this.selection || ''),
      ...this.messages
        .filter((msg) => msg.id !== assistantMessageId)
        .map((msg) => toJS(msg)),
      {
        role: 'user',
        content: content,
      },
    ];

    logger.debug('Sending messages to LLM', { messageCount: messages.length });
    return messages;
  }

  /**
   * 调用 LLM API 并返回响应
   * @param messages - 要发送的消息数组
   * @returns Fetch Response 对象
   * @throws {Error} 当 HTTP 请求失败时抛出错误
   */
  private async callLLMAPI(
    messages: Array<{ role: string; content: string }>
  ): Promise<Response> {
    const response = await fetch(
      this.options.apiBase || 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model || 'gpt-3.5-turbo',
          messages: messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response;
  }

  /**
   * 解析 SSE（Server-Sent Events）数据行
   * @param line - SSE 数据行
   * @returns 解析后的内容，如果无法解析则返回 null
   */
  private parseSSELine(line: string): string | null {
    if (line.trim() === '' || line.trim() === 'data: [DONE]') {
      return null;
    }

    if (!line.startsWith('data: ')) {
      return null;
    }

    try {
      const jsonData = line.slice(6); // 移除 'data: ' 前缀
      const data = JSON.parse(jsonData);
      return data.choices[0]?.delta?.content || null;
    } catch (e) {
      logger.warn('Failed to parse SSE data', e, { line });
      return null;
    }
  }

  /**
   * 处理流式响应
   * @param response - Fetch Response 对象
   * @param assistantMessageId - 助理消息 ID
   * @returns Promise，处理完成时 resolve
   */
  private async processStreamResponse(
    response: Response,
    assistantMessageId: string
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      let isReading = true;
      while (isReading) {
        const { done, value } = await reader.read();
        if (done) {
          isReading = false;
          break;
        }

        // 解码并添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 处理完整的行
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留未完成的行

        for (const line of lines) {
          const content = this.parseSSELine(line);
          if (content) {
            this.updateStreamingMessage(assistantMessageId, content);
          }
        }
      }

      // 处理缓冲区中剩余的数据
      if (buffer.trim() !== '') {
        const content = this.parseSSELine(buffer);
        if (content) {
          this.updateStreamingMessage(assistantMessageId, content);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 处理发送消息过程中的错误
   * @param error - 错误对象
   */
  private handleSendError(error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : '发送消息失败';

    runInAction(() => {
      this.error = errorMessage;
      this.streamingMessageId = undefined;
      // 移除流式消息占位符
      this.messages = this.messages.filter((msg) => msg.isStreaming !== true);
    });

    logger.error('Failed to send message', error);
  }
}
