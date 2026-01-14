export interface AgentConfig {
  apiKey: string;
  model: string;
  apiBase: string;
  fileUri?: string;
  rootUri?: string;
  maxIterations?: number;
  showThinking?: boolean;
  contextWindowSize?: number;
  compressRatio?: number;
  compressCheckInterval?: number;
  minCompressCheckInterval?: number;
  tokenLimitError?: string[];
}
