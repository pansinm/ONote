# LLMBox Agent Architecture

## Overview

LLMBox is an AI agent system integrated into ONote, providing intelligent assistance for note-taking and file management tasks.

## Architecture

```
+------------------------------------------------------------------------------------------+
|                                   LLMBox Agent                                           |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +------------------------------------------------------------------------------------+  |
|  |                            Renderer Process (React)                                |  |
|  |  +----------------------------------+  +------------------------------------------+  |  |
|  |  |          UI Components            |  |           State Management               |  |  |
|  |  |  +--------+  +--------+  +-------+  |  +------------------------------------+  |  |  |
|  |  |  |Input   |  |Chat    |  |Todo   |  |  |            AgentStore               |  |  |  |
|  |  |  |Area    |  |Panel   |  |Panel  |  |  |  (MobX Store for React components)  |  |  |  |
|  |  |  +--------+  +--------+  +-------+  |  +------------------------------------+  |  |  |
|  |  +----------------------------------+  +------------------------------------------+  |  |
|  |                                     |                                                 |  |
|  |  +----------------------------------+  +------------------------------------------+  |  |
|  |  |            Services               |  |            Agent Engine                  |  |  |
|  |  |  +------------+  +------------+  |  |  +----------------+  +------------------+  |  |  |
|  |  |  |Context     |  |Config      |  |  |  |AgentOrchestrator|  |   ToolRegistry   |  |  |  |
|  |  |  |Manager     |  |Manager     |  |  |  |  (Execution)    |  |   (Tool Loader)  |  |  |  |
|  |  |  +------------+  +------------+  |  |  +----------------+  +------------------+  |  |  |
|  |  +----------------------------------+  +------------------------------------------+  |  |
|  +------------------------------------------------------------------------------------+  |
|                                        |                                                 |
|                              IPC Bridge (preload)                                       |
|                                        |                                                 |
+----------------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------------+
|                               Main Process (Node.js)                                    |
|  +------------------------------------------------------------------------------------+  |
|  |                          IPC Handlers                                              |  |
|  |  +------------------+  +----------------------+  +------------------------------+  |  |
|  |  | AgentContext     |  | LLMConversation      |  | FileSystem Handler          |  |  |
|  |  | Handler          |  | Handler              |  |                              |  |  |
|  |  +------------------+  +----------------------+  +------------------------------+  |  |
|  +------------------------------------------------------------------------------------+  |
|                                        |                                                 |
|                                        v                                                 |
|  +------------------------------------------------------------------------------------+  |
|  |                          File System Storage                                       |  |
|  |  ${workspace}/.onote/data/{hash}/ai/                                               |  |
|  |  ├── agent.json         <- PersistedContext (conversation + messages)             |  |
|  |  └── execution-state.json <- PersistedExecutionState (execution steps + todos)    |  |
|  +------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------+
```

## Directory Structure

```
packages/renderer/src/llmbox/
├── types/                          # Unified type definitions
│   ├── index.ts                    # Main export entry
│   ├── message.ts                  # Message types (Message, ToolMessage, AssistantMessage)
│   ├── execution-step.ts           # ExecutionStep discriminated union
│   ├── persisted.ts                # Persistence types (PersistedContext, PersistedExecutionState)
│   ├── tool.ts                     # Tool definitions
│   └── todo.ts                     # TodoItem type
├── core/
│   ├── index.ts                    # Re-exports types/ and API clients
│   ├── api/
│   │   └── client.ts               # LLMClient for API calls
│   ├── config.ts                   # Configuration
│   └── validation.ts               # Zod schemas
├── agent/
│   ├── orchestrator.ts             # Main execution orchestrator
│   ├── strategy.ts                 # Agent strategies
│   ├── prompts.ts                  # System prompts
│   └── tools/
│       ├── registry.ts             # Tool registry
│       ├── file.ts                 # File operations
│       ├── search.ts               # Search tools
│       ├── todo.ts                 # Todo tools
│       └── todo-manager.ts         # Todo state management
├── store/
│   ├── AgentStore.ts               # MobX store for React integration
│   └── AgentState.ts               # Agent state management
├── service/
│   ├── ContextManager.ts           # Context persistence
│   └── ConfigManager.ts            # Configuration management
├── constants/
│   └── LLMBoxConstants.ts          # IPC message types
├── components/                     # React components
└── __tests__/                      # Tests
```

## Type System

### Message Types

```typescript
// Base message structure
interface BaseMessage {
  id: string;                       // Unique identifier
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;                  // Message content
  timestamp: number;                // Unix timestamp (ms)
}

// Tool execution result
interface ToolMessage extends BaseMessage {
  role: 'tool';
  toolCallId: string;               // Links to tool_call
  toolName: string;
  result?: unknown;
  error?: string;
}

// Assistant response with tool calls
interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  toolCalls?: ToolCall[];
}

// Tool call from assistant
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}
```

### ExecutionStep Types (Discriminated Union)

```typescript
interface BaseStep {
  id: string;
  timestamp: number;
  duration?: number;
}

// LLM thinking process
interface ThinkingStep extends BaseStep {
  type: 'thinking';
  content: string;
  isStreaming?: boolean;
}

// Tool invocation
interface ToolCallStep extends BaseStep {
  type: 'tool_call';
  toolCallId: string;               // Links to ToolCall.id
  toolName: string;
  params: Record<string, unknown>;
}

// Tool execution result
interface ToolResultStep extends BaseStep {
  type: 'tool_result';
  toolCallId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

// Task list snapshot
interface TodoStep extends BaseStep {
  type: 'todo';
  todos: TodoItem[];
}

// Final response
interface FinalAnswerStep extends BaseStep {
  type: 'final_answer';
  content: string;
}

// Error occurrence
interface ErrorStep extends BaseStep {
  type: 'error';
  message: string;
  recoverable: boolean;
}

type ExecutionStep = ThinkingStep | ToolCallStep | ToolResultStep | TodoStep | FinalAnswerStep | ErrorStep;
```

### Persistence Types

```typescript
interface PersistedContext {
  version: 1;                       // Schema version
  savedAt: number;                  // Unix timestamp
  fileUri: string;                  // Associated file
  messages: Array<{ role: string; content: string }>;
}

interface PersistedExecutionState {
  version: 1;
  savedAt: number;
  fileUri: string;
  prompt: string;
  startTime: number;
  iteration: number;
  agentState: 'idle' | 'thinking' | 'executing';
  todos: TodoItem[];
  steps: ExecutionStep[];
}
```

## Data Flow

### Execution Flow

```
1. User Input (InputArea)
   |
   v
2. AgentStore.runAgent(prompt)
   |
   v
3. AgentExecutor.runAgent()
   |
   +-> AgentOrchestrator.run()
       |
       +-> buildMessages()
       |   - System prompt with tool descriptions
       |   - Conversation history
       |   - User prompt
       |
        +-> LLMClient.complete()
       |   - Sends messages to LLM API
       |   - Receives streaming response
       |   - Returns content + toolCalls
       |
       +-> For each tool call:
           +-> executeToolCall()
           |   - Find tool in registry
           |   - Execute via IPC
           |   - Add result to messages
           |
           +-> Emit 'step' event
               - Records execution log
```

### Persistence Flow

```
Save Context:
AgentContextManager.saveContext()
  |
  +-> Build PersistedContext
  |   - version: 1
  |   - messages: simplified history
  |
  +-> IPC: AGENT_CONTEXT_SAVE
      |
      v
  AgentContextHandler (Main)
      |
      +-> Write to ${hash}/ai/agent.json
```

```
Save Execution State:
AgentContextManager.saveExecutionState()
  |
  +-> Build PersistedExecutionState
  |   - version: 1
  |   - steps: execution log
  |   - todos: task list
  |
  +-> IPC: AGENT_EXECUTION_STATE_SAVE
      |
      v
  AgentContextHandler (Main)
      |
      +-> Write to ${hash}/ai/execution-state.json
```

## Key Design Principles

### UNIX Philosophy Alignment

| Principle | Implementation |
|-----------|---------------|
| Small is beautiful | Each type has single responsibility |
| Do one thing well | `ExecutionStep` discriminated union separates concerns |
| Data abstraction | Unified types in `types/` directory |
| Avoid data bloat | `PersistedContext` only stores messages, not execution log |
| Everything has version | All persisted data includes `version: 1` |

### Type Safety

- **Single source of truth**: All types defined in `types/` directory
- **Discriminated unions**: TypeScript narrow types based on `type` field
- **Number timestamps**: Uses Unix timestamp (ms) instead of Date objects for cross-process serialization

## Exports

```typescript
// Main export from types/
export {
  Message, ToolMessage, AssistantMessage, MessageRole,
  ToolCall, Tool, ToolParameters,
  ExecutionStep, ThinkingStep, ToolCallStep, ToolResultStep, TodoStep, FinalAnswerStep, ErrorStep,
  PersistedContext, PersistedExecutionState,
  TodoItem,
} from './types';

// From core/
export { LLMClient } from './core/api/client';
export { Config, DEFAULT_CONFIG } from './core/config';

// From agent/
export { AgentOrchestrator } from './agent/orchestrator';
export { ToolRegistry } from './agent/tools/registry';
export { TodoManager } from './agent/tools/todo-manager';
export { AgentStrategy } from './agent/strategy';
```
