import { LLMBOX_IPC_TYPES, type IChannel } from './constants';
import type { AgentStepEvent } from '../types/AgentEvents';

export function useMainIpc(channel: IChannel) {
  return {
    async sendMessage(input: string, callback: (event: AgentStepEvent) => void) {
      await channel.send({
        type: LLMBOX_IPC_TYPES.SEND_MESSAGE,
        args: { input, callback },
      });
    },
  };
}
