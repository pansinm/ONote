import { AgentConfig } from '../types';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('ConfigManager');

export class ConfigManager {
  private config: AgentConfig;
  private onote: any;

  constructor(config: AgentConfig) {
    this.config = config;
    this.onote = (window as any).__settings;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  updateRootUri(rootUri: string): void {
    this.config = { ...this.config, rootUri };
  }

  async fetchLLMConfig(): Promise<{ apiKey: string; model: string; apiBase: string } | null> {
    try {
      const response = await this.onote.setting.invoke('getAll');

      if (!response) {
        logger.warn('No response from main process for LLM config');
        return {
          apiKey: this.config.apiKey,
          model: this.config.model,
          apiBase: this.config.apiBase,
        };
      }

      if (!response.apiKey) {
        logger.warn('No API key in response from main process');
        return null;
      }

      const result = {
        apiKey: response.apiKey,
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
