export interface Config {
  llm: {
    apiBase: string;
    model: string;
    timeout: number;
  };
  agent: {
    maxIterations: number;
    compressRatio: number;
    contextWindow: number;
    compressCheckInterval: number;
    minCompressCheckInterval: number;
  };
}

export const DEFAULT_CONFIG: Config = {
  llm: {
    apiBase: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    timeout: 60000,
  },
  agent: {
    maxIterations: 50,
    compressRatio: 0.3,
    contextWindow: 128000,
    compressCheckInterval: 10,
    minCompressCheckInterval: 5,
  },
};
