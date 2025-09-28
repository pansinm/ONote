import type { LLMChatStore } from './LLMChatStore';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageUrls?: string[];
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  streamingMessageId?: string;
  note?: string;
  selection?: string;
}

export interface LLMBoxProps {
  store: LLMChatStore;
}
