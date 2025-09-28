import { makeAutoObservable, runInAction, toJS } from 'mobx';
import type { Message, ChatState } from './types';
import { uuid } from '../common/tunnel/utils';

interface LLMChatStoreOptions {
  apiKey?: string;
  model?: string;
  apiBase?: string;
}

function buildSystemMessage(note: string, selection: string) {
  const prompt = `
请担任专业的笔记助手，基于用户提供的笔记上下文，对其**选中的内容**进行精准操作。

## 笔记全文
<markdown>
${note}
</markdown>

## 选中内容
<markdown>
${selection}
</markdown>

## 指令
请根据上述"选中内容"，并结合"笔记全文"的上下文，执行以下任务：
1.  **核心任务**：直接对选中内容进行【用户在此处描述具体需求，例如：解释、总结、扩写、翻译、查找关联概念等】。
2.  **输出要求**：
    *   **聚焦**：回答需紧密围绕选中内容，无需复述或概括全文。
    *   **简洁**：语言精炼，条理清晰，避免冗长的引言和结尾。
    *   **准确**：确保信息正确，不引入笔记上下文外的无关信息。
    *   **格式**：请使用恰当的Markdown格式（如列表、加粗、代码块等）来组织你的回答，使其易于阅读。

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

  constructor(options: LLMChatStoreOptions = {}) {
    this.options = options;
    makeAutoObservable(this);
  }

  updateOptions(options: LLMChatStoreOptions) {
    this.options = { ...this.options, ...options };
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
  }

  sendMessage = async (content: string, imageUrls?: string[]) => {
    if (!this.options.apiKey) {
      runInAction(() => {
        this.error = 'API密钥未配置';
      });
      return;
    }

    const userMessage: Omit<Message, 'id'> = {
      content,
      role: 'user',
      timestamp: new Date(),
      imageUrls,
    };

    const userMessageId = this.addMessage(userMessage);

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      // 创建助理消息占位符
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
      console.log(messages);
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
            stream: true, // 启用流式响应
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`,
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
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
              if (line.trim() === '') continue;
              if (line.trim() === 'data: [DONE]') continue;

              if (line.startsWith('data: ')) {
                try {
                  const jsonData = line.slice(6); // 移除 'data: ' 前缀
                  const data = JSON.parse(jsonData);
                  const content = data.choices[0]?.delta?.content;

                  if (content) {
                    this.updateStreamingMessage(assistantMessageId, content);
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line, e);
                }
              }
            }
          }

          // 处理缓冲区中剩余的数据
          if (buffer.trim() !== '') {
            if (buffer.startsWith('data: ')) {
              try {
                const jsonData = buffer.slice(6);
                const data = JSON.parse(jsonData);
                const content = data.choices[0]?.delta?.content;

                if (content) {
                  this.updateStreamingMessage(assistantMessageId, content);
                }
              } catch (e) {
                console.warn('Failed to parse remaining buffer:', buffer, e);
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      this.completeStreamingMessage(assistantMessageId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '发送消息失败';

      runInAction(() => {
        this.error = errorMessage;
        this.streamingMessageId = undefined;
        // 移除流式消息占位符
        this.messages = this.messages.filter((msg) => msg.isStreaming !== true);
      });
    } finally {
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
}
