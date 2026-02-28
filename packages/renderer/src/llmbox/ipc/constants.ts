import type { createChannel } from 'bidc';

export const LLMBOX_IPC_TYPES = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  AGENT_STEP_EVENT: 'AGENT_STEP_EVENT',
} as const;

type LLMBOX_IPC_TYPES = keyof typeof LLMBOX_IPC_TYPES;

export const LLMBOX_CHANNEL_ID = 'BIDC_LLMBOX_CHANNEL';

export type IChannel = ReturnType<typeof createChannel>;
