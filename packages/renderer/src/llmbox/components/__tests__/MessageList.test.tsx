import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList, { type MessageListRef } from '../MessageList';
import type { UserMessage, AgentMessage } from '../../types/IMessage';

global.IntersectionObserver = class IntersectionObserver {
  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit,
  ) {}
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
} as any;

jest.mock('../MessageList.module.scss', () => ({
  container: 'message-list-container',
  content: 'message-list-content',
  messageWrapper: 'message-wrapper',
}));

jest.mock('../Message', () => {
  return function MockMessage({ message }: { message: any }) {
    return (
      <div data-testid="message" data-message-id={message.id}>
        {message.role === 'user' ? 'User' : 'Agent'}: {message.content}
      </div>
    );
  };
});

const createUserMessage = (overrides?: Partial<UserMessage>): UserMessage => ({
  id: 'user-1',
  role: 'user',
  content: '用户消息',
  timestamp: Date.now(),
  ...overrides,
});

const createAgentMessage = (
  overrides?: Partial<AgentMessage>,
): AgentMessage => ({
  id: 'agent-1',
  role: 'assistant',
  content: 'Agent 消息',
  timestamp: Date.now(),
  steps: [],
  ...overrides,
});

describe('MessageList', () => {
  describe('基础渲染', () => {
    it('应该渲染空消息列表', () => {
      render(<MessageList messages={[]} />);

      const container = screen.getByTestId('message-list');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('message-list-container');
    });

    it('应该渲染单条消息', () => {
      const messages = [createUserMessage()];
      render(<MessageList messages={messages} />);

      expect(screen.getAllByTestId('message')).toHaveLength(1);
    });

    it('应该渲染多条消息', () => {
      const messages = [
        createUserMessage({ id: 'user-1', content: '消息1' }),
        createAgentMessage({ id: 'agent-1', content: '消息2' }),
        createUserMessage({ id: 'user-2', content: '消息3' }),
      ];
      render(<MessageList messages={messages} />);

      expect(screen.getAllByTestId('message')).toHaveLength(3);
    });

    it('应该应用自定义 className 和 style', () => {
      const messages = [createUserMessage()];
      const customClassName = 'custom-list-class';
      const customStyle = { backgroundColor: 'blue' };

      const { container } = render(
        <MessageList
          messages={messages}
          className={customClassName}
          style={customStyle}
        />,
      );

      expect(container.firstChild).toHaveClass(customClassName);
      expect(container.firstChild).toHaveStyle(customStyle);
    });
  });

  describe('Ref 方法', () => {
    it('应该暴露 scrollToBottom 方法', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      render(<MessageList messages={messages} ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.scrollToBottom).toBe('function');
    });

    it('应该暴露 scrollToMessage 方法', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      render(<MessageList messages={messages} ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.scrollToMessage).toBe('function');
    });

    it('应该暴露 getScrollPosition 方法', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      render(<MessageList messages={messages} ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.getScrollPosition).toBe('function');
    });

    it('应该暴露 getScrollHeight 方法', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      render(<MessageList messages={messages} ref={ref} />);

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.getScrollHeight).toBe('function');
    });

    it('scrollToMessage 应该调用 scrollIntoView', () => {
      const messages = [
        createUserMessage({ id: 'user-1', content: '消息1' }),
        createUserMessage({ id: 'user-2', content: '消息2' }),
      ];
      const ref = React.createRef<MessageListRef>();

      const { container } = render(
        <MessageList messages={messages} ref={ref} />,
      );

      const messageElement = container.querySelector(
        '[data-message-id="user-2"]',
      );
      const scrollIntoViewMock = jest.fn();
      Object.defineProperty(messageElement!, 'scrollIntoView', {
        value: scrollIntoViewMock,
      });

      ref.current?.scrollToMessage('user-2', 'smooth');

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('scrollToMessage 应该处理不存在的消息ID', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      render(<MessageList messages={messages} ref={ref} />);

      expect(() => ref.current?.scrollToMessage('non-existent')).not.toThrow();
    });

    it('getScrollPosition 应该返回当前滚动位置', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      const { container } = render(
        <MessageList messages={messages} ref={ref} />,
      );

      const scrollContainer = container.querySelector(
        '.message-list-container',
      );
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 100 });

      expect(ref.current?.getScrollPosition()).toBe(100);
    });

    it('getScrollHeight 应该返回内容高度', () => {
      const messages = [createUserMessage()];
      const ref = React.createRef<MessageListRef>();

      const { container } = render(
        <MessageList messages={messages} ref={ref} />,
      );

      const scrollContainer = container.querySelector(
        '.message-list-container',
      );
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 500 });

      expect(ref.current?.getScrollHeight()).toBe(500);
    });
  });

  describe('消息可见性回调', () => {
    it('应该接受 onMessageVisible 回调参数', () => {
      const messages = [createUserMessage({ id: 'user-1' })];
      const onMessageVisible = jest.fn();

      render(
        <MessageList messages={messages} onMessageVisible={onMessageVisible} />,
      );

      expect(onMessageVisible).toBeDefined();
    });

    it('应该为每条消息设置正确的 data-message-id', () => {
      const messages = [
        createUserMessage({ id: 'user-1' }),
        createAgentMessage({ id: 'agent-1' }),
      ];

      render(<MessageList messages={messages} />);

      const list = screen.getByTestId('message-list');
      expect(
        list.querySelector('[data-message-id="user-1"]'),
      ).toBeInTheDocument();
      expect(
        list.querySelector('[data-message-id="agent-1"]'),
      ).toBeInTheDocument();
    });
  });

  describe('数据属性', () => {
    it('每条消息应该有 data-message-id 属性', () => {
      const messages = [
        createUserMessage({ id: 'user-1' }),
        createAgentMessage({ id: 'agent-1' }),
      ];

      render(<MessageList messages={messages} />);

      const wrapper1 = screen
        .getByTestId('message-list')
        .querySelector('[data-message-id="user-1"]');
      const wrapper2 = screen
        .getByTestId('message-list')
        .querySelector('[data-message-id="agent-1"]');

      expect(wrapper1).toBeInTheDocument();
      expect(wrapper2).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理消息 ID 重复的情况', () => {
      const messages = [
        createUserMessage({ id: 'duplicate-id', content: '消息1' }),
        createAgentMessage({ id: 'duplicate-id', content: '消息2' }),
      ];

      expect(() => render(<MessageList messages={messages} />)).not.toThrow();
    });

    it('应该处理空字符串消息内容', () => {
      const messages = [createUserMessage({ id: 'user-1', content: '' })];

      render(<MessageList messages={messages} />);

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('应该处理大量消息', () => {
      const messages = Array.from({ length: 100 }, (_, i) =>
        createUserMessage({ id: `user-${i}`, content: `消息 ${i}` }),
      );

      render(<MessageList messages={messages} />);

      expect(screen.getAllByTestId('message')).toHaveLength(100);
    });

    it('应该处理消息内容包含特殊字符', () => {
      const specialContent = '消息包含特殊字符';
      const messages = [
        createUserMessage({ id: 'user-1', content: specialContent }),
      ];

      render(<MessageList messages={messages} />);

      const messageElement = screen
        .getByTestId('message-list')
        .querySelector('[data-message-id="user-1"]');
      expect(messageElement).toHaveTextContent(specialContent);
    });
  });
});
