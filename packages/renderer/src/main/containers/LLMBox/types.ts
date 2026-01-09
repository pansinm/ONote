export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageUrls?: string[];
  isStreaming?: boolean;
}

export interface EditorContentChangedMessage {
  type: 'EDITOR_CONTENT_CHANGED';
  data: {
    content: string;
    selection: string;
  };
}

export interface EditorSelectionChangedMessage {
  type: 'EDITOR_SELECTION_CHANGED';
  data: {
    selection: string;
  };
}

export interface EditorFileOpenMessage {
  type: 'EDITOR_FILE_OPEN';
  data: {
    uri: string;
  };
}

export interface GetCurrentFileInfoMessage {
  type: 'GET_CURRENT_FILE_INFO';
  data?: undefined;
}

export interface GetCurrentFileInfoResponse {
  fileUri?: string;
  rootUri?: string;
}

export interface LLMConversationLoadMessage {
  type: 'LLM_CONVERSATION_LOAD';
  data: {
    fileUri: string;
  };
}

export interface LLMConversationLoadResponse {
  error?: string;
  messages?: Message[];
}

export interface LLMConversationSaveMessage {
  type: 'LLM_CONVERSATION_SAVE';
  data: {
    fileUri: string;
    messages: Message[];
  };
}

export interface LLMConversationSaveResponse {
  error?: string;
  success?: boolean;
}

export interface AgentFileReadMessage {
  type: 'AGENT_FILE_READ';
  data: {
    uri: string;
  };
}

export interface AgentFileReadResponse {
  error?: string;
  content?: string;
}

export interface AgentFileWriteMessage {
  type: 'AGENT_FILE_WRITE';
  data: {
    uri: string;
    content: string;
  };
}

export interface AgentFileWriteResponse {
  error?: string;
  success?: boolean;
}

export interface AgentFileReplaceMessage {
  type: 'AGENT_FILE_REPLACE';
  data: {
    uri: string;
    operations: Array<{
      mode: 'string' | 'regex' | 'line_range' | 'line_number';
      search: string;
      replace: string;
      replaceAll?: boolean;
      caseSensitive?: boolean;
      lineStart?: number;
      lineEnd?: number;
    }>;
    preview?: boolean;
  };
}

export interface AgentFileReplaceResponse {
  error?: string;
  success?: boolean;
  preview?: string;
  modifiedLines?: number[];
  operations?: Array<{
    success: boolean;
    matches: number;
    changedLines: number[];
    error?: string;
  }>;
}

export interface AgentFileCreateMessage {
  type: 'AGENT_FILE_CREATE';
  data: {
    uri: string;
    content?: string;
  };
}

export interface AgentFileCreateResponse {
  error?: string;
  success?: boolean;
}

export interface AgentFileDeleteMessage {
  type: 'AGENT_FILE_DELETE';
  data: {
    uri: string;
  };
}

export interface AgentFileDeleteResponse {
  error?: string;
  success?: boolean;
}

export interface AgentFileListMessage {
  type: 'AGENT_FILE_LIST';
  data: {
    uri: string;
  };
}

export interface AgentFileListResponse {
  error?: string;
  files?: Array<{
    name: string;
    uri: string;
    isDirectory: boolean;
  }>;
}

export interface AgentFileSearchMessage {
  type: 'AGENT_FILE_SEARCH';
  data: {
    rootUri: string;
    keywords: string;
  };
}

export interface AgentFileSearchResponse {
  error?: string;
  results?: Array<{
    name: string;
    uri: string;
    isDirectory: boolean;
  }>;
}

export interface AgentFileSearchInMessage {
  type: 'AGENT_FILE_SEARCH_IN';
  data: {
    uri: string;
    pattern: string;
  };
}

export interface AgentFileSearchInResponse {
  error?: string;
  matches?: Array<{
    line: number;
    text: string;
  }>;
  count?: number;
}

export interface AgentGetRootUriMessage {
  type: 'AGENT_GET_ROOT_URI';
  data?: undefined;
}

export interface AgentGetRootUriResponse {
  rootUri?: string;
}

export interface AgentGetActiveFileUriMessage {
  type: 'AGENT_GET_ACTIVE_FILE_URI';
  data?: undefined;
}

export interface AgentGetActiveFileUriResponse {
  fileUri?: string;
}

export interface AgentContextLoadMessage {
  type: 'AGENT_CONTEXT_LOAD';
  data: {
    fileUri: string;
  };
}

export interface AgentContextLoadResponse {
  error?: string;
  context?: any;
}

export interface AgentContextSaveMessage {
  type: 'AGENT_CONTEXT_SAVE';
  data: {
    fileUri: string;
    rootUri: string;
    context: any;
  };
}

export interface AgentContextSaveResponse {
  error?: string;
  success?: boolean;
}

export type LLMBoxMessage =
  | EditorContentChangedMessage
  | EditorSelectionChangedMessage
  | EditorFileOpenMessage
  | GetCurrentFileInfoMessage
  | LLMConversationLoadMessage
  | LLMConversationSaveMessage
  | AgentFileReadMessage
  | AgentFileWriteMessage
  | AgentFileReplaceMessage
  | AgentFileCreateMessage
  | AgentFileDeleteMessage
  | AgentFileListMessage
  | AgentFileSearchMessage
  | AgentFileSearchInMessage
  | AgentGetRootUriMessage
  | AgentGetActiveFileUriMessage
  | AgentContextLoadMessage
  | AgentContextSaveMessage;

export type LLMBoxResponse =
  | GetCurrentFileInfoResponse
  | LLMConversationLoadResponse
  | LLMConversationSaveResponse
  | AgentFileReadResponse
  | AgentFileWriteResponse
  | AgentFileReplaceResponse
  | AgentFileCreateResponse
  | AgentFileDeleteResponse
  | AgentFileListResponse
  | AgentFileSearchResponse
  | AgentFileSearchInResponse
  | AgentGetRootUriResponse
  | AgentGetActiveFileUriResponse
  | AgentContextLoadResponse
  | AgentContextSaveResponse;
