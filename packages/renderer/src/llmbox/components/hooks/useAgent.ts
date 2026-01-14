import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ExecutionStep, TodoItem, AgentConfig, Message } from '../../core/types';
import { AgentStore } from '../../AgentStore';

interface Channel {
  send: (message: { type: string; data: unknown }) => Promise<Record<string, unknown>>;
}

interface UseAgentOptions {
  config: AgentConfig;
  channel: Channel;
}

interface AgentState {
  agentState: 'idle' | 'thinking' | 'executing';
  isRunning: boolean;
  error: string | null;
  todos: TodoItem[];
  executionLog: ExecutionStep[];
  conversationHistory: Message[];
}

export function useAgent(options: UseAgentOptions) {
  const stateRef = useRef<AgentState>({
    agentState: 'idle',
    isRunning: false,
    error: null,
    todos: [],
    executionLog: [],
    conversationHistory: [],
  });

  const [state, setState] = useState<AgentState>(stateRef.current);
  const store = useMemo(() => new AgentStore(options.config, options.channel), [options.config, options.channel]);

  useEffect(() => {
    store.loadTools();
  }, [store]);

  const run = useCallback(async (prompt: string) => {
    stateRef.current.error = null;
    stateRef.current.executionLog = [];
    stateRef.current.agentState = 'thinking';
    stateRef.current.isRunning = true;
    setState({ ...stateRef.current });

    try {
      await store.runAgent(prompt);
    } catch (err) {
      stateRef.current.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      stateRef.current.isRunning = false;
      stateRef.current.agentState = 'idle';
      setState({ ...stateRef.current });
    }
  }, [store]);

  const stop = useCallback(() => {
    store.stopAgent();
    stateRef.current.isRunning = false;
    stateRef.current.agentState = 'idle';
    setState({ ...stateRef.current });
  }, [store]);

  return {
    state,
    actions: {
      run,
      stop,
      updateFileUri: store.updateFileUri.bind(store),
      updateEditorContent: store.updateEditorContent.bind(store),
    },
  };
}
