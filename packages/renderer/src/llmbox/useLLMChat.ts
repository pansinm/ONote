import { useState, useCallback } from 'react';
import type { Message, ChatState } from './types';

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
  });

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
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

      addMessage(userMessage);

      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
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
              stream: false,
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

        const data = await response.json();
        const assistantMessage: Omit<Message, 'id'> = {
          content: data.choices[0]?.message?.content || '没有收到回复',
          role: 'assistant',
          timestamp: new Date(),
        };

        addMessage(assistantMessage);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '发送消息失败';
        setChatState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      } finally {
        setChatState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [options.apiKey, options.model, options.apiBase, addMessage],
  );

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    sendMessage,
    clearMessages,
  };
};
