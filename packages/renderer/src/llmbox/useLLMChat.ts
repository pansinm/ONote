import { useState, useCallback } from 'react';
import type { Message, ChatState } from './types';
import { uuid } from '../common/tunnel/utils';

interface UseLLMChatOptions {
  apiKey?: string;
  model?: string;
  apiBase?: string;
}

export const useLLMChat = (options: UseLLMChatOptions = {}) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    streamingMessageId: undefined,
  });

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: uuid('message-'),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage.id;
  }, []);

  const updateStreamingMessage = useCallback(
    (messageId: string, content: string) => {
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content + content, isStreaming: true }
            : msg,
        ),
      }));
    },
    [],
  );

  const completeStreamingMessage = useCallback((messageId: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg,
      ),
      streamingMessageId: undefined,
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string, imageUrls?: string[]) => {
      if (!options.apiKey) {
        setChatState((prev) => ({
          ...prev,
          error: 'API密钥未配置',
        }));
        return;
      }

      const userMessage: Omit<Message, 'id'> = {
        content,
        role: 'user',
        timestamp: new Date(),
        imageUrls,
      };

      const userMessageId = addMessage(userMessage);

      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // 创建助理消息占位符
        const assistantMessage: Omit<Message, 'id'> = {
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          isStreaming: true,
        };

        const assistantMessageId = addMessage(assistantMessage);

        setChatState((prev) => ({
          ...prev,
          streamingMessageId: assistantMessageId,
        }));

        const response = await fetch(
          options.apiBase || 'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${options.apiKey}`,
            },
            body: JSON.stringify({
              model: options.model || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'user',
                  content: content,
                },
              ],
              stream: true, // 启用流式响应
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message ||
              `HTTP error! status: ${response.status}`,
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
                      updateStreamingMessage(assistantMessageId, content);
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
                    updateStreamingMessage(assistantMessageId, content);
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

        completeStreamingMessage(assistantMessageId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '发送消息失败';
        setChatState((prev) => ({
          ...prev,
          error: errorMessage,
          streamingMessageId: undefined,
        }));

        // 移除流式消息占位符
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.filter((msg) => msg.isStreaming !== true),
        }));
      } finally {
        setChatState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [
      options.apiKey,
      options.model,
      options.apiBase,
      addMessage,
      updateStreamingMessage,
      completeStreamingMessage,
    ],
  );

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: [],
      error: null,
      streamingMessageId: undefined,
    }));
  }, []);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    sendMessage,
    clearMessages,
    streamingMessageId: chatState.streamingMessageId,
  };
};
