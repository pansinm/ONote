/**
 * 实现Agent组合，将相关组件进行合理布局
 * 1. 仅mock数据，暂时不要实现真正的Agent
 * 2. 支持 style 和 className 属性
 * 3. 样式美观，符合项目整体风格
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './Header';
import MessageList, { type MessageListRef } from './MessageList';
import InputArea from './InputArea';
import type { Message, UserMessage, AgentMessage } from '../types/IMessage';
import type { AgentState } from './Header';
import styles from './LLMBox.module.scss';

export interface LLMBoxProps {
  // 自定义容器类名（用于外部样式覆盖）
  className?: string;

  // 自定义容器样式（用于外部样式定义）
  style?: React.CSSProperties;
}

// ========== Mock 数据 ==========

// 生成唯一 ID
const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Mock 消息数据
const mockMessages: Message[] = [
  // Session Divider
  {
    id: 'session-1',
    role: 'session_divider',
    sessionId: 'session-1',
    title: '代码重构会话',
    description: '讨论组件性能优化方案',
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 1800000,
    messageCount: 3,
    tags: ['重构', '性能优化'],
    icon: 'folder',
    color: '#0078d4',
    timestamp: Date.now() - 3600000,
  },
  // User Message 1
  {
    id: 'msg-1',
    role: 'user',
    content: '请帮我分析这个组件的性能问题',
    timestamp: Date.now() - 1800000,
  },
  // Agent Message 1 - 带完整工作流程
  {
    id: 'msg-2',
    role: 'assistant',
    content: '让我分析一下...',
    timestamp: Date.now() - 1700000,
    steps: [
      {
        type: 'thinking',
        content: '正在分析组件结构和依赖关系，检查是否有不必要的重渲染...',
        isCompleted: true,
      },
      {
        type: 'tool_call',
        content: '读取组件文件内容',
        toolCalls: [
          {
            id: 'tool-1',
            name: 'read_file',
            arguments: {
              path: '/src/components/MyComponent.tsx',
            },
            result: `import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <div>{data?.name}</div>;
};`,
          },
        ],
        isCompleted: true,
      },
      {
        type: 'summary',
        content: `分析完成，发现以下性能问题：

1. **未使用 React.memo**：组件在父组件重渲染时会不必要地重新渲染
2. **useEffect 缺少依赖项**：可能导致闭包陷阱或意外的行为

**建议的修复方案：**

\`\`\`typescript
import React, { useState, useEffect, memo } from 'react';

const MyComponent = memo(() => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, []);

  return <div>{data?.name}</div>;
});
\`\`\``,

        isCompleted: true,
      },
    ],
  },
  // User Message 2
  {
    id: 'msg-3',
    role: 'user',
    content: '帮我实现这些优化',
    timestamp: Date.now() - 900000,
  },
  // Agent Message 2 - 正在处理中（模拟 streaming）
  {
    id: 'msg-4',
    role: 'assistant',
    content: '',
    timestamp: Date.now() - 800000,
    steps: [
      {
        type: 'thinking',
        content: '正在准备修改文件...',
        isCompleted: true,
      },
      {
        type: 'tool_call',
        content: '写入优化后的代码',
        toolCalls: [
          {
            id: 'tool-2',
            name: 'write_file',
            arguments: {
              path: '/src/components/MyComponent.tsx',
              content:
                'import React, { useState, useEffect, memo } from "react";\n...',
            },
          },
        ],
        isCompleted: false,
      },
    ],
    isStreaming: true,
  },
];

// ========== LLMBox 组件 ==========

const LLMBox: FC<LLMBoxProps> = ({ className, style }) => {
  // State
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messageListRef = useRef<MessageListRef>(null);

  // 初始滚动到底部
  useEffect(() => {
    messageListRef.current?.scrollToBottom('auto');
  }, []);

  // Handlers
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    // 添加用户消息
    const userMessage: UserMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    messageListRef.current?.scrollToBottom('auto');
    setIsLoading(true);
    setAgentState('thinking');

    // 模拟 Agent 响应
    setTimeout(() => {
      setAgentState('executing');

      setTimeout(() => {
        // 模拟 Agent 响应消息
        const agentMessage: AgentMessage = {
          id: generateId(),
          role: 'assistant',
          content: '收到你的消息，正在处理中...',
          timestamp: Date.now(),
          steps: [
            {
              type: 'thinking',
              content: '正在分析你的需求...',
              isCompleted: true,
            },
          ],
        };

        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);
        setAgentState('idle');

        // 滚动到底部
        messageListRef.current?.scrollToBottom('smooth');
      }, 1000);
    }, 500);
  }, [inputValue, isLoading]);

  const handleClearQuote = useCallback(() => {
    // 当前没有实现引用功能，预留接口
  }, []);

  return (
    <div className={classNames(styles.container, className)} style={style}>
      {/* Header - Agent 标题和状态 */}
      <Header title="Agent" agentState={agentState} className={styles.header} />

      {/* MessageList - 消息列表 */}
      <MessageList
        ref={messageListRef}
        messages={messages}
        className={styles.messageList}
      />

      {/* InputArea - 输入区域 */}
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onClearQuote={handleClearQuote}
        placeholder="输入消息... (Ctrl+Enter 发送)"
        disabled={isLoading}
        loading={isLoading}
        minRows={3}
        className={styles.inputArea}
      />
    </div>
  );
};

export default LLMBox;
