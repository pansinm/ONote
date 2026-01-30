import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IMessage from '../Message';
import type {
  UserMessage,
  AgentMessage,
  WorkStep,
  ToolCall,
} from '../../types/IMessage';

// Mock Fluent UI 图标
jest.mock('@fluentui/react-icons', () => ({
  CheckmarkCircle12Regular: () => (
    <span data-testid="check-icon" aria-label="Completed" />
  ),
  ArrowClockwise12Regular: () => (
    <span data-testid="spin-icon" aria-label="In progress" />
  ),
  ChevronDown12Regular: ({ className }: any) => (
    <span data-testid="expand-icon" className={className} />
  ),
}));

// Mock 样式文件
jest.mock('../Message.module.scss', () => ({
  message: 'message',
  'message--user': 'message--user',
  'message--agent': 'message--agent',
  avatar: 'avatar',
  userAvatar: 'user-avatar',
  agentAvatar: 'agent-avatar',
  streaming: 'streaming',
  userContent: 'user-content',
  userTimestamp: 'user-timestamp',
  agentContent: 'agent-content',
  workSteps: 'work-steps',
  workStep: 'work-step',
  'workStep--thinking': 'work-step--thinking',
  'workStep--toolCall': 'work-step--toolCall',
  'workStep--summary': 'work-step--summary',
  workStep__header: 'work-step__header',
  workStep__content: 'work-step__content',
  toolCall: 'tool-call',
  toolCallHeader: 'tool-call-header',
  toolCallHeader__left: 'tool-call-header__left',
  toolCallHeader__name: 'tool-call-header__name',
  toolCallHeader__expand: 'tool-call-header__expand',
  expanded: 'expanded',
  toolCallBody: 'tool-call-body',
  toolCallSection: 'tool-call-section',
  toolCallSection__label: 'tool-call-section__label',
  toolCallArguments: 'tool-call-arguments',
  toolCallResult: 'tool-call-result',
  streamingIndicator: 'streaming-indicator',
  streamingDots: 'streaming-dots',
  streamingText: 'streaming-text',
  dot: 'dot',
  statusIcon__completed: 'status-icon--completed',
  statusIcon__inProgress: 'status-icon--in-progress',
  statusIcon__pending: 'status-icon--pending',
}));

// 创建测试用的用户消息
const createUserMessage = (overrides?: Partial<UserMessage>): UserMessage => ({
  id: 'user-1',
  role: 'user',
  content: '这是用户消息',
  timestamp: Date.now(),
  ...overrides,
});

// 创建测试用的 Agent 消息
const createAgentMessage = (
  overrides?: Partial<AgentMessage>,
): AgentMessage => ({
  id: 'agent-1',
  role: 'assistant',
  content: '这是 Agent 消息',
  timestamp: Date.now(),
  steps: [],
  isStreaming: false,
  ...overrides,
});

// 创建测试用的工具调用
const createToolCall = (overrides?: Partial<ToolCall>): ToolCall => ({
  id: 'tool-1',
  name: 'test_tool',
  arguments: { query: 'test' },
  result: 'Tool execution result',
  ...overrides,
});

// 创建测试用的步骤
const createWorkStep = (overrides?: Partial<WorkStep>): WorkStep => ({
  type: 'thinking',
  content: 'Thinking content',
  isCompleted: false,
  ...overrides,
});

describe('Message', () => {
  // 1. 基础渲染测试
  describe('基础渲染', () => {
    it('应该渲染用户消息', () => {
      const userMessage = createUserMessage();
      render(<IMessage message={userMessage} />);

      expect(screen.getByLabelText('User')).toBeInTheDocument();
      expect(screen.getByText('这是用户消息')).toBeInTheDocument();
    });

    it('应该渲染 Agent 消息', () => {
      const agentMessage = createAgentMessage();
      render(<IMessage message={agentMessage} />);

      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
    });

    it('应该应用自定义 className 和 style', () => {
      const userMessage = createUserMessage();
      const customClassName = 'custom-class';
      const customStyle = { backgroundColor: 'red' };

      const { container } = render(
        <IMessage
          message={userMessage}
          className={customClassName}
          style={customStyle}
        />,
      );

      const wrapper = container.querySelector('.message');
      expect(wrapper).toHaveClass(customClassName);
      expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
    });

    it('应该显示用户消息的时间戳', () => {
      const userMessage = createUserMessage();
      const { container } = render(<IMessage message={userMessage} />);

      const timestamp = container.querySelector('.user-timestamp');
      expect(timestamp).toBeInTheDocument();
    });

    it('应该不渲染系统消息', () => {
      const systemMessage = {
        id: 'system-1',
        role: 'system' as const,
        content: 'System message',
        timestamp: Date.now(),
      };

      const { container } = render(<IMessage message={systemMessage as any} />);
      expect(container.firstChild).toBe(null);
    });
  });

  // 2. 用户消息测试
  describe('用户消息', () => {
    it('应该显示正确的用户头像', () => {
      const userMessage = createUserMessage();
      render(<IMessage message={userMessage} />);

      const avatar = screen.getByLabelText('User');
      expect(avatar).toBeInTheDocument();
    });

    it('应该显示用户消息内容', () => {
      const content = '这是一条测试用户消息';
      const userMessage = createUserMessage({ content });
      render(<IMessage message={userMessage} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('应该处理多行用户消息内容', () => {
      const content = '第一行\n第二行\n第三行';
      const userMessage = createUserMessage({ content });
      render(<IMessage message={userMessage} />);

      // Use a function matcher to check if the text content includes all lines
      const messageContent = screen.getByText((text) => {
        return (
          text.includes('第一行') &&
          text.includes('第二行') &&
          text.includes('第三行')
        );
      });
      expect(messageContent).toBeInTheDocument();
    });
  });

  // 3. Agent 消息测试
  describe('Agent 消息', () => {
    it('应该显示正确的 Agent 头像', () => {
      const agentMessage = createAgentMessage();
      render(<IMessage message={agentMessage} />);

      const avatar = screen.getByLabelText('Agent');
      expect(avatar).toBeInTheDocument();
    });

    it('应该在无步骤时显示消息内容', () => {
      const content = 'Agent 回复内容';
      const agentMessage = createAgentMessage({ content, steps: [] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('应该在 streaming 状态时添加动画类', () => {
      const agentMessage = createAgentMessage({ isStreaming: true });
      const { container } = render(<IMessage message={agentMessage} />);

      const avatar = container.querySelector('.agent-avatar');
      expect(avatar).toHaveClass('streaming');
    });

    it('应该在非 streaming 状态时不添加动画类', () => {
      const agentMessage = createAgentMessage({ isStreaming: false });
      const { container } = render(<IMessage message={agentMessage} />);

      const avatar = container.querySelector('.agent-avatar');
      expect(avatar).not.toHaveClass('streaming');
    });
  });

  // 4. 工作步骤测试
  describe('工作步骤', () => {
    it('应该渲染思考步骤', () => {
      const thinkingStep = createWorkStep({
        type: 'thinking',
        content: '正在思考问题...',
      });
      const agentMessage = createAgentMessage({ steps: [thinkingStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('Thinking')).toBeInTheDocument();
      expect(screen.getByText('正在思考问题...')).toBeInTheDocument();
    });

    it('应该渲染工具调用步骤', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        content: 'Calling tool',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('Tool Call')).toBeInTheDocument();
      expect(screen.getByText('test_tool')).toBeInTheDocument();
    });

    it('应该渲染总结步骤', () => {
      const summaryStep = createWorkStep({
        type: 'summary',
        content: '任务完成',
        isCompleted: true,
      });
      const agentMessage = createAgentMessage({ steps: [summaryStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('任务完成')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('应该显示未完成的总结步骤的加载指示器', () => {
      const summaryStep = createWorkStep({
        type: 'summary',
        content: '生成中...',
        isCompleted: false,
      });
      const agentMessage = createAgentMessage({ steps: [summaryStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
      expect(screen.getByTestId('spin-icon')).toBeInTheDocument();
    });

    it('应该渲染多个步骤', () => {
      const steps: WorkStep[] = [
        createWorkStep({ type: 'thinking', content: '思考中...' }),
        createWorkStep({
          type: 'tool_call',
          content: '调用工具',
          toolCalls: [createToolCall()],
        }),
        createWorkStep({
          type: 'summary',
          content: '总结',
          isCompleted: true,
        }),
      ];
      const agentMessage = createAgentMessage({ steps });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('Thinking')).toBeInTheDocument();
      expect(screen.getByText('Tool Call')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
  });

  // 5. 工具调用详情测试
  describe('工具调用详情（可展开）', () => {
    it('应该默认收起工具调用详情', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      // Use queryByText because the elements don't exist when collapsed
      expect(screen.queryByText('Arguments:')).not.toBeInTheDocument();
      expect(screen.queryByText('Result:')).not.toBeInTheDocument();
    });

    it('应该在点击后展开工具调用详情', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.click(expandButton);

      expect(screen.getByText('Arguments:')).toBeVisible();
      expect(screen.getByText('Result:')).toBeInTheDocument();
    });

    it('应该显示工具调用参数', () => {
      const toolCall = createToolCall({
        arguments: { query: 'test', limit: 10 },
      });
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.click(expandButton);

      expect(screen.getByText(/"query": "test"/)).toBeInTheDocument();
      expect(screen.getByText(/"limit": 10/)).toBeInTheDocument();
    });

    it('应该显示工具调用结果', () => {
      const toolCall = createToolCall({
        result: 'Execution successful',
      });
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.click(expandButton);

      expect(screen.getByText('Execution successful')).toBeInTheDocument();
    });

    it('应该支持键盘导航（Enter 键展开）', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.keyDown(expandButton, { key: 'Enter' });

      expect(screen.getByText('Arguments:')).toBeVisible();
    });

    it('应该支持键盘导航（Space 键展开）', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.keyDown(expandButton, { key: ' ' });

      expect(screen.getByText('Arguments:')).toBeVisible();
    });

    it('应该在展开时旋转展开图标', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      const icon = screen.getByTestId('expand-icon');

      expect(icon).not.toHaveClass('expanded');

      fireEvent.click(expandButton);

      expect(icon).toHaveClass('expanded');
    });
  });

  // 6. 多个工具调用测试
  describe('多个工具调用', () => {
    it('应该渲染多个工具调用', () => {
      const toolCalls = [
        createToolCall({
          id: 'tool-1',
          name: 'search',
          arguments: { q: 'test' },
        }),
        createToolCall({
          id: 'tool-2',
          name: 'read_file',
          arguments: { path: '/test' },
        }),
      ];
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls,
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByText('search')).toBeInTheDocument();
      expect(screen.getByText('read_file')).toBeInTheDocument();
    });
  });

  // 7. 边界情况测试
  describe('边界情况', () => {
    it('应该处理空的步骤数组', () => {
      const agentMessage = createAgentMessage({ steps: [] });
      const { container } = render(<IMessage message={agentMessage} />);

      expect(container.querySelector('.work-steps')).not.toBeInTheDocument();
    });

    it('应该处理空字符串的消息内容', () => {
      const userMessage = createUserMessage({ content: '' });
      const { container } = render(<IMessage message={userMessage} />);

      expect(container.querySelector('.user-content')).toBeInTheDocument();
    });

    it('应该处理没有结果的工具调用', () => {
      const toolCall = createToolCall({ result: undefined });
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.click(expandButton);

      expect(screen.queryByText('Result:')).not.toBeInTheDocument();
    });

    it('应该处理复杂的参数对象', () => {
      const complexArgs = {
        nested: { object: { with: ['array', 'values'] } },
        number: 123,
        boolean: true,
        null: null,
      };
      const toolCall = createToolCall({ arguments: complexArgs });
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });
      fireEvent.click(expandButton);

      expect(screen.getByText(/"nested"/)).toBeInTheDocument();
      expect(screen.getByText(/"array"/)).toBeInTheDocument();
    });
  });

  // 8. 可访问性测试
  describe('可访问性', () => {
    it('应该为工具调用按钮提供 aria-expanded 属性', () => {
      const toolCall = createToolCall();
      const toolCallStep = createWorkStep({
        type: 'tool_call',
        toolCalls: [toolCall],
      });
      const agentMessage = createAgentMessage({ steps: [toolCallStep] });
      render(<IMessage message={agentMessage} />);

      const expandButton = screen.getByRole('button', {
        name: /toggle tool call details/i,
      });

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该为用户提供 aria-label', () => {
      const userMessage = createUserMessage();
      render(<IMessage message={userMessage} />);

      expect(screen.getByLabelText('User')).toBeInTheDocument();
    });

    it('应该为 Agent 提供 aria-label', () => {
      const agentMessage = createAgentMessage();
      render(<IMessage message={agentMessage} />);

      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
    });

    it('应该为状态图标提供 aria-label', () => {
      const summaryStep = createWorkStep({
        type: 'summary',
        content: '完成',
        isCompleted: true,
      });
      const agentMessage = createAgentMessage({ steps: [summaryStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    });

    it('应该为进行中状态提供 aria-label', () => {
      const summaryStep = createWorkStep({
        type: 'summary',
        content: '生成中',
        isCompleted: false,
      });
      const agentMessage = createAgentMessage({ steps: [summaryStep] });
      render(<IMessage message={agentMessage} />);

      expect(screen.getByLabelText('In progress')).toBeInTheDocument();
    });
  });
});
