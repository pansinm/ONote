import type { Tool } from '../../core/types';
import type { LLMBoxMessageType } from '../../constants/LLMBoxConstants';
import { createFileTools } from './file';
import { createTodoTools, type TodoManager } from './todo';

interface Channel {
  send: (message: { type: LLMBoxMessageType; data: unknown }) => Promise<Record<string, unknown>>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor(channel: Channel, todoManager?: TodoManager) {
    const fileTools = createFileTools(channel);
    fileTools.forEach((tool) => this.tools.set(tool.name, tool));

    if (todoManager) {
      const todoTools = createTodoTools(todoManager);
      todoTools.forEach((tool) => this.tools.set(tool.name, tool));
    }
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getOpenAISchema(): Array<{
    type: string;
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as Record<string, unknown>,
      },
    }));
  }
}

export type { Channel };
