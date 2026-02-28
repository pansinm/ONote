import { makeAutoObservable, runInAction } from 'mobx';
import type { AgentStepEvent, ExecutionStep } from '../types/AgentEvents';
import { v4 as uuidv4 } from 'uuid';

export class AgentStore {
  agentState: 'idle' | 'thinking' | 'executing' = 'idle';
  steps: ExecutionStep[] = [];
  currentMessageId: string | null = null;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  handleEvent(event: AgentStepEvent) {
    switch (event.type) {
      case 'agent-start':
        this.handleAgentStart();
        break;
      case 'agent-complete':
        this.handleAgentComplete();
        break;
      case 'agent-error':
        this.handleAgentError(event.error);
        break;
      case 'step-start':
        this.handleStepStart(event.step);
        break;
      case 'step-delta':
        this.handleStepDelta(event.stepId, event.delta);
        break;
      case 'step-complete':
        this.handleStepComplete(event.stepId);
        break;
      case 'step-error':
        this.handleStepError(event.stepId, event.error);
        break;
    }
  }

  private handleAgentStart() {
    runInAction(() => {
      this.agentState = 'thinking';
      this.steps = [];
      this.error = null;
      this.currentMessageId = uuidv4();
    });
  }

  private handleAgentComplete() {
    runInAction(() => {
      this.agentState = 'idle';
    });
  }

  private handleAgentError(error: string) {
    runInAction(() => {
      this.agentState = 'idle';
      this.error = error;
    });
  }

  private handleStepStart(step: ExecutionStep) {
    runInAction(() => {
      if (step.type === 'tool_call') {
        this.agentState = 'executing';
      } else if (step.type === 'thinking') {
        this.agentState = 'thinking';
      }
      this.steps.push(step);
    });
  }

  private handleStepDelta(stepId: string, delta: string) {
    runInAction(() => {
      const step = this.steps.find((s) => s.id === stepId);
      if (step) {
        step.content += delta;
      }
    });
  }

  private handleStepComplete(stepId: string) {
    runInAction(() => {
      const step = this.steps.find((s) => s.id === stepId);
      if (step) {
        step.isCompleted = true;
      }
    });
  }

  private handleStepError(stepId: string, error: string) {
    runInAction(() => {
      const step = this.steps.find((s) => s.id === stepId);
      if (step) {
        step.type = 'error';
        step.content = error;
        step.isCompleted = true;
      }
    });
  }

  reset() {
    runInAction(() => {
      this.agentState = 'idle';
      this.steps = [];
      this.currentMessageId = null;
      this.error = null;
    });
  }
}
