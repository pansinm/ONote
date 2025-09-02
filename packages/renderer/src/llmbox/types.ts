export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageUrls?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface LLMBoxProps {
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}
