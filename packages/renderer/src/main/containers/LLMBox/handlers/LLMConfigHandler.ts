import type { LLMBoxMessage, LLMBoxResponse, LLMConfigMessage, LLMConfigResponse } from '../types';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/utils/constants';
import { BaseHandler } from './BaseHandler';

interface LLMConfigData {
  apiKey?: string;
  model?: string;
  apiBase?: string;
}

export class LLMConfigGetHandler extends BaseHandler {
  async handle(data: LLMConfigData): Promise<LLMConfigResponse> {
    const onote = (window as any).onote;
    if (!onote || !onote.setting) {
      return {
        apiKey: '',
        model: '',
        apiBase: '',
        error: 'Setting API not available',
      };
    }

    try {
      const settings = await onote.setting.invoke('getAll');
      const llmConfig: LLMConfigResponse = {
        apiKey: data.apiKey ?? settings['chatgpt.api-key'] ?? '',
        model: data.model ?? settings['chatgpt.model-name'] ?? 'gpt-4o',
        apiBase: data.apiBase ?? settings['chatgpt.base-url'] ?? '',
      };

      return llmConfig;
    } catch (error) {
      return {
        apiKey: '',
        model: '',
        apiBase: '',
        error: error instanceof Error ? error.message : 'Failed to get LLM config',
      };
    }
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.LLM_CONFIG_GET;
  }
}
