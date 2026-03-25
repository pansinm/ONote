import type { TextStreamPart } from 'ai';
import { getOrCreateAgent } from './agent';
import { AgentConversationStore } from './AgentConversationStore';
import type {
  AgentStepEvent,
  ExecutionStep,
  ToolCall,
} from '/@/main/types/AgentEvents';
import stores from '../stores';
import { v4 as uuidv4 } from 'uuid';
import { buildMessageState } from './prompts';

export class Assistant {
  private currentSteps: Map<string, ExecutionStep> = new Map();
  private currentToolCalls: Map<string, ToolCall> = new Map();
  private conversationStore = new AgentConversationStore();

  async chat(input: string, callback: (event: AgentStepEvent) => void) {
    try {
      const agent = getOrCreateAgent();
      this.currentSteps.clear();
      this.currentToolCalls.clear();

      const fileUri = stores.activationStore.activeFileUri;
      const rootUri = stores.activationStore.rootUri;
      this.conversationStore.setContext(rootUri, fileUri);

      callback({ type: 'agent-start' });

      const stream = await agent.stream({
        messages: [
          { role: 'user', content: input + `\n\n${buildMessageState()}` },
        ],
      });

      for await (const chunk of stream.fullStream) {
        await this.handleStreamChunk(chunk, callback);
      }

      const response = await stream.response;

      const messages = response.messages || [];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage) {
        let content = '';
        if (Array.isArray(lastMessage.content)) {
          const textPart = lastMessage.content.find(
            (part: any) => part.type === 'text',
          ) as any;
          if (textPart && textPart.text) {
            content = textPart.text;
          }
        } else if (typeof lastMessage.content === 'string') {
          content = lastMessage.content;
        }

        if (content) {
          const finalStep: ExecutionStep = {
            id: uuidv4(),
            type: 'summary',
            content,
            isCompleted: true,
            timestamp: Date.now(),
          };
          this.currentSteps.set(finalStep.id, finalStep);
          callback({ type: 'step-start', step: finalStep });
        }
      }

      callback({ type: 'agent-complete' });

      const conversationId = await this.conversationStore.saveConversation({
        userInput: input,
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
          },
          {
            id: uuidv4(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            steps: Array.from(this.currentSteps.values()),
          },
        ],
      });

      return { conversationId, steps: Array.from(this.currentSteps.values()) };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      callback({ type: 'agent-error', error: errorMessage });
      throw error;
    } finally {
      this.currentSteps.clear();
      this.currentToolCalls.clear();
    }
  }

  private async handleStreamChunk(
    chunk: TextStreamPart<any>,
    callback: (event: AgentStepEvent) => void,
  ) {
    switch (chunk.type) {
      case 'reasoning-start': {
        const step: ExecutionStep = {
          id: chunk.id || uuidv4(),
          type: 'thinking',
          content: '',
          isCompleted: false,
          timestamp: Date.now(),
        };
        this.currentSteps.set(step.id, step);
        callback({ type: 'step-start', step });
        break;
      }

      case 'reasoning-delta': {
        const step = this.currentSteps.get(chunk.id);
        if (step) {
          step.content += chunk.text || '';
          callback({
            type: 'step-delta',
            stepId: step.id,
            delta: chunk.text || '',
          });
        }
        break;
      }

      case 'reasoning-end': {
        const step = this.currentSteps.get(chunk.id);
        if (step) {
          step.isCompleted = true;
          callback({ type: 'step-complete', stepId: step.id });
        }
        break;
      }

      case 'tool-call': {
        const toolCallId = chunk.toolCallId || uuidv4();
        const toolCall: ToolCall = {
          id: toolCallId,
          name: chunk.toolName,
          arguments:
            'input' in chunk ? (chunk.input as Record<string, unknown>) : {},
        };
        this.currentToolCalls.set(toolCallId, toolCall);

        const step: ExecutionStep = {
          id: uuidv4(),
          type: 'tool_call',
          content: `Calling ${chunk.toolName}...`,
          toolCalls: [toolCall],
          isCompleted: false,
          timestamp: Date.now(),
        };
        this.currentSteps.set(step.id, step);
        callback({ type: 'step-start', step });
        break;
      }

      case 'tool-result': {
        const stepId = Array.from(this.currentSteps.entries()).find(
          ([, step]) =>
            step.type === 'tool_call' &&
            step.toolCalls?.some((tc) => tc.id === chunk.toolCallId),
        )?.[0];

        if (stepId) {
          const step = this.currentSteps.get(stepId);
          if (step && step.toolCalls) {
            const toolCall = step.toolCalls.find(
              (tc) => tc.id === chunk.toolCallId,
            );
            if (toolCall) {
              if (chunk.output) {
                toolCall.result = typeof chunk.output === 'string' 
                  ? chunk.output 
                  : JSON.stringify(chunk.output, null, 2);
              }
              step.isCompleted = true;
              step.content = `Called ${chunk.toolName} ${toolCall.result?.includes('Error') ? 'failed' : 'successfully'}`;
              callback({ type: 'step-complete', stepId });
            }
          }
        }
        break;
      }

      case 'text-delta': {
        break;
      }

      case 'text-end': {
        break;
      }

      default:
        break;
    }
  }
}
