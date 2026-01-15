import type {
  ExecutionStep,
  ThinkingStep,
  ToolCallStep,
  ToolResultStep,
  FinalAnswerStep,
  ErrorStep,
  TodoItem,
} from '../types';

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  return new Date(timestamp).toLocaleTimeString();
}

export function getStepContent(step: ExecutionStep): string | null {
  if (step.type === 'thinking') {
    return step.content;
  }
  if (step.type === 'final_answer') {
    return step.content;
  }
  return null;
}

export function getStepToolName(step: ExecutionStep): string | null {
  if (step.type === 'tool_call') {
    return step.toolName;
  }
  return null;
}

export function getStepParams(step: ExecutionStep): Record<string, unknown> | null {
  if (step.type === 'tool_call') {
    return step.params;
  }
  return null;
}

export function getStepResult(step: ExecutionStep): unknown | null {
  if (step.type === 'tool_result') {
    return step.result;
  }
  return null;
}

export function getStepError(step: ExecutionStep): string | null {
  if (step.type === 'error') {
    return step.message;
  }
  if (step.type === 'tool_result' && step.error) {
    return step.error;
  }
  return null;
}

export function getStepTodos(step: ExecutionStep): TodoItem[] | null {
  if (step.type === 'todo') {
    return step.todos;
  }
  return null;
}

export function isThinkingStep(step: ExecutionStep): step is ThinkingStep {
  return step.type === 'thinking';
}

export function isToolCallStep(step: ExecutionStep): step is ToolCallStep {
  return step.type === 'tool_call';
}

export function isToolResultStep(step: ExecutionStep): step is ToolResultStep {
  return step.type === 'tool_result';
}

export function isFinalAnswerStep(step: ExecutionStep): step is FinalAnswerStep {
  return step.type === 'final_answer';
}

export function isErrorStep(step: ExecutionStep): step is ErrorStep {
  return step.type === 'error';
}
