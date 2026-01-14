import { AgentConfig } from './core/types';
import { getLogger } from '/@/shared/logger';
import { LLM_BOX_MESSAGE_TYPES } from './constants/LLMBoxConstants';

interface Channel {
  send: (message: {
    type: string;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

interface LLMConfigResponse {
  apiKey?: string;
  model?: string;
  apiBase?: string;
  error?: string;
}

const logger = getLogger('ConfigManager');

export class ConfigManager {
  private config: AgentConfig;
  private channel: Channel | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  setChannel(channel: Channel): void {
    this.channel = channel;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  updateRootUri(rootUri: string): void {
    this.config = { ...this.config, rootUri };
  }

  async fetchLLMConfig(): Promise<{ apiKey: string; model: string; apiBase: string } | null> {
    if (!this.channel) {
      logger.warn('Channel not set, using default config');
      return {
        apiKey: this.config.apiKey,
        model: this.config.model,
        apiBase: this.config.apiBase,
      };
    }

    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.LLM_CONFIG_GET,
        data: {},
      })) as LLMConfigResponse;

      if (response.error) {
        logger.warn('Failed to fetch LLM config from main process', { error: response.error });
        return null;
      }

      const result = {
        apiKey: response.apiKey ?? this.config.apiKey,
        model: response.model ?? this.config.model,
        apiBase: response.apiBase ?? this.config.apiBase,
      };

      logger.debug('LLM config fetched', {
        apiBase: result.apiBase,
        model: result.model,
        hasApiKey: !!result.apiKey,
      });

      return result;
    } catch (error) {
      logger.error('Error fetching LLM config', error);
      return null;
    }
  }
}

export default ConfigManager;
