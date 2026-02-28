import type { Tool } from 'ai';
import { stepCountIs, ToolLoopAgent } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import stores from '../stores';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '/@/common/constants/SettingKey';
import { SYSTEM_INSTRUCTIONS } from './prompts';
import { TOOLS } from './tools';

export interface AgentOptions {
  prompt: string;
  tools: Record<string, Tool>;
}

let agent: ToolLoopAgent;
let prevConfig = '';

export function getOrCreateAgent() {
  const baseUrl = stores.settingStore.settings[LLM_BASE_URL] as string;
  const apiKey = stores.settingStore.settings[LLM_API_KEY] as string;
  const modelName = stores.settingStore.settings[LLM_MODEL_NAME] as string;

  if (!baseUrl || !apiKey || !modelName) {
    throw new Error('必须配置LLM');
  }

  const openai = createOpenAICompatible({
    baseURL: baseUrl,
    apiKey,
    name: modelName,
  });
  const config = JSON.stringify({ baseUrl, apiKey, modelName });
  const isSame = prevConfig === config;
  if (!agent || !isSame) {
    prevConfig = config;
    agent = new ToolLoopAgent({
      model: openai(modelName),
      instructions: SYSTEM_INSTRUCTIONS,
      tools: TOOLS,
      stopWhen: stepCountIs(10),
    });
    return agent;
  }

  return agent;
}
