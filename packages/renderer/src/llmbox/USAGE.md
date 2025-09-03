# LLMBox 使用指南

## 功能特性

### 🎨 界面设计
- **上下布局**: 底部输入框，上部聊天记录区域
- **消息区分**: 左侧显示模型消息，右侧显示用户消息
- **时间戳**: 每条消息都显示发送时间
- **响应式设计**: 适配不同屏幕尺寸

### ⌨️ 输入功能
- **Enter发送**: 按Enter键快速发送消息
- **Shift+Enter换行**: 支持多行文本输入
- **图片支持**: 支持粘贴和拖拽图片
- **文件上传**: 点击📎按钮上传图片文件

### 🤖 AI集成
- **OpenAI兼容**: 支持所有兼容OpenAI API的大模型
- **流式响应**: 支持实时显示模型回复
- **错误处理**: 完善的错误提示和重试机制

## 快速开始

### 基本用法

```tsx
import React from 'react';
import { LLMBox, useLLMChat } from './llmbox';

const MyChatComponent: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useLLMChat({
    apiKey: 'your-openai-api-key', // 必填
    model: 'gpt-3.5-turbo',        // 可选，默认为gpt-3.5-turbo
    apiBase: 'https://api.openai.com/v1/chat/completions' // 可选，支持自定义API端点
  });

  return (
    <div style={{ height: '600px' }}>
      <LLMBox
        onSendMessage={sendMessage}
        messages={messages}
        isLoading={isLoading}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};
```

### 配置选项

```typescript
interface UseLLMChatOptions {
  apiKey?: string;      // OpenAI API密钥
  model?: string;       // 模型名称，默认'gpt-3.5-turbo'
  apiBase?: string;     // API基础URL，默认OpenAI官方API
}
```

## 组件说明

### LLMBox 主组件
```tsx
interface LLMBoxProps {
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}
```

### Message 数据结构
```typescript
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageUrls?: string[]; // 图片URL数组
  isStreaming?: boolean; // 是否为流式消息
}
```

## 样式定制

所有组件都使用CSS Modules，您可以轻松自定义样式：

- `LLMBox.module.scss` - 主容器样式
- `ChatArea.module.scss` - 聊天区域样式
- `MessageList.module.scss` - 消息列表样式
- `MessageItem.module.scss` - 单条消息样式
- `InputArea.module.scss` - 输入区域样式

## 开发原则

### SOLID原则
- **单一职责**: 每个组件职责明确，易于维护
- **开闭原则**: 组件设计支持扩展，不修改原有代码
- **依赖倒置**: 依赖抽象接口，不依赖具体实现

### 技术栈
- **TypeScript**: 类型安全，更好的开发体验
- **React Hooks**: 函数式组件，状态管理清晰
- **CSS Modules**: 样式隔离，避免冲突
- **ESLint/Prettier**: 代码规范，统一风格

## 注意事项

1. **API密钥安全**: 不要在前端代码中硬编码API密钥
2. **图片处理**: 上传的图片会转换为Blob URL，注意内存管理
3. **错误处理**: 建议添加适当的错误提示和重试机制
4. **性能优化**: 对于大量消息，建议实现虚拟滚动

## 示例

查看 `LLMBoxExample.tsx` 获取完整的使用示例。

## 许可证

遵循项目原有的许可证协议。
