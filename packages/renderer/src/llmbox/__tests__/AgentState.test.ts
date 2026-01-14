import { AgentState } from '../AgentState';

describe('AgentState', () => {
  let state: AgentState;

  beforeEach(() => {
    state = new AgentState();
  });

  describe('状态管理', () => {
    it('初始状态正确', () => {
      expect(state.todos).toEqual([]);
      expect(state.executionLog).toEqual([]);
      expect(state.conversationHistory).toEqual([]);
      expect(state.agentState).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.isRunning).toBe(false);
    });

    it('setRunning 正确设置运行状态', () => {
      state.setRunning(true);
      expect(state.isRunning).toBe(true);

      state.setRunning(false);
      expect(state.isRunning).toBe(false);
    });

    it('setError 正确设置错误', () => {
      state.setError('Test error');
      expect(state.error).toBe('Test error');

      state.setError(null);
      expect(state.error).toBeNull();
    });

    it('setAgentState 正确设置状态', () => {
      state.setAgentState('thinking');
      expect(state.agentState).toBe('thinking');

      state.setAgentState('executing');
      expect(state.agentState).toBe('executing');

      state.setAgentState('idle');
      expect(state.agentState).toBe('idle');
    });
  });

  describe('消息管理', () => {
    it('addMessage 正确添加消息', () => {
      const message = state.addMessage({
        role: 'user',
        content: 'Hello',
      });

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(state.conversationHistory).toHaveLength(1);
    });

    it('clearConversation 正确清空对话', () => {
      state.addMessage({ role: 'user', content: 'Hello' });
      state.addMessage({ role: 'assistant', content: 'Hi' });

      expect(state.conversationHistory).toHaveLength(2);

      state.clearConversation();

      expect(state.conversationHistory).toEqual([]);
    });

    it('isConversationHistoryEmpty 正确判断', () => {
      expect(state.isConversationHistoryEmpty()).toBe(true);

      state.addMessage({ role: 'user', content: 'Hello' });

      expect(state.isConversationHistoryEmpty()).toBe(false);
    });
  });

  describe('执行日志管理', () => {
    it('addStep 正确添加步骤', () => {
      const stepId = state.addStep({
        type: 'thinking',
        content: 'Processing...',
      });

      expect(stepId).toBeDefined();
      expect(state.executionLog).toHaveLength(1);
      expect(state.executionLog[0].type).toBe('thinking');
      expect(state.executionLog[0].content).toBe('Processing...');
    });

    it('updateThinkingStepContent 正确更新思考步骤内容', () => {
      const stepId = state.addStep({
        type: 'thinking',
        content: 'Initial',
      });

      state.updateThinkingStepContent(stepId, 'Updated content');

      expect(state.executionLog[0].content).toBe('Updated content');
    });

    it('clearLog 正确清空日志', () => {
      state.addStep({ type: 'thinking', content: 'Step 1' });
      state.addStep({ type: 'tool_call', content: 'Step 2' });

      expect(state.executionLog).toHaveLength(2);

      state.clearLog();

      expect(state.executionLog).toEqual([]);
    });

    it('isExecutionLogEmpty 正确判断', () => {
      expect(state.isExecutionLogEmpty()).toBe(true);

      state.addStep({ type: 'thinking', content: 'Step' });

      expect(state.isExecutionLogEmpty()).toBe(false);
    });
  });

  describe('编辑器状态', () => {
    it('updateEditorContent 正确更新内容和选择', () => {
      state.updateEditorContent('file content', 'selected text');

      expect(state.content).toBe('file content');
      expect(state.selection).toBe('selected text');
    });

    it('updateFileUri 正确更新文件 URI', () => {
      state.updateFileUri('file:///path/to/file.md');

      expect(state.fileUri).toBe('file:///path/to/file.md');
    });
  });

  describe('待办事项', () => {
    it('setTodos 正确设置待办事项', () => {
      const todos = [
        {
          id: '1',
          description: 'Task 1',
          status: 'pending' as const,
          priority: 'high' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      state.setTodos(todos);

      expect(state.todos).toEqual(todos);
    });
  });

  describe('保存状态', () => {
    it('setSavedState 正确设置保存状态', () => {
      state.setSavedState(true);
      expect(state.hasSavedState).toBe(true);
      expect(state.lastStateSavedAt).toBeInstanceOf(Date);

      state.setSavedState(false);
      expect(state.hasSavedState).toBe(false);
      expect(state.lastStateSavedAt).toBeNull();
    });
  });

  describe('加载执行状态', () => {
    it('loadExecutionState 正确加载状态', () => {
      const mockState = {
        prompt: 'test prompt',
        startTime: new Date(),
        isRunning: false,
        agentState: 'idle' as const,
        currentIteration: 5,
        maxIterations: 50,
        todos: [],
        executionLog: [{ id: '1', type: 'thinking', content: 'test', timestamp: new Date() }],
        conversationHistory: [{ id: '2', role: 'user', content: 'hello', timestamp: new Date() }],
        fileUri: 'file:///test.md',
        rootUri: 'file:///',
        content: 'content',
        selection: 'selection',
        savedAt: new Date(),
      };

      state.loadExecutionState(mockState);

      expect(state.executionLog).toHaveLength(1);
      expect(state.conversationHistory).toHaveLength(1);
      expect(state.content).toBe('content');
      expect(state.selection).toBe('selection');
      expect(state.hasSavedState).toBe(true);
    });
  });

  describe('工具管理', () => {
    it('setTools 正确设置工具', () => {
      const tools = [
        {
          name: 'testTool',
          description: 'Test tool',
          parameters: { type: 'object', properties: {} },
          executor: async () => 'result',
        },
      ];

      state.setTools(tools);

      expect(state.tools).toEqual(tools);
    });
  });
});
