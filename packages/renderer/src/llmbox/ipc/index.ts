import { createChannel } from 'bidc';
import type { LLMBoxMessageType } from '../constants/LLMBoxConstants';

export interface Channel {
  send: (message: {
    type: LLMBoxMessageType;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

export const channel = createChannel('MAIN_FRAME-LLM_BOX');
