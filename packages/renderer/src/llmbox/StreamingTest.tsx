import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { LLMChatStore } from './LLMChatStore';
import LLMBox from './LLMBox';
import { verifyStreamingSupport } from './verify-streaming';

// 流式功能测试组件
export const StreamingTest: React.FC = observer(() => {
  const [store] = useState(
    () =>
      new LLMChatStore({
        apiKey: process.env.OPENAI_API_KEY || 'test-key', // 从环境变量获取或使用测试密钥
      }),
  );

  const [testContent, setTestContent] = useState('');
  const [streamingSupported, setStreamingSupported] = useState(false);
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    // 检查流式支持
    const supported = verifyStreamingSupport();
    setStreamingSupported(supported);
    setTestStatus(supported ? '环境支持流式调用' : '环境不支持流式调用');
  }, []);

  const testStreaming = async () => {
    if (!testContent.trim()) {
      setTestStatus('请输入测试消息');
      return;
    }

    if (!streamingSupported) {
      setTestStatus('当前环境不支持流式调用');
      return;
    }

    setTestStatus('发送消息中...');

    try {
      await store.sendMessage(testContent);
      setTestStatus('消息发送完成');
    } catch (err) {
      setTestStatus(
        `发送失败: ${err instanceof Error ? err.message : '未知错误'}`,
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>流式调用测试</h2>

      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            marginBottom: '10px',
            color: streamingSupported ? 'green' : 'red',
          }}
        >
          状态: {testStatus}
        </div>

        <input
          type="text"
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="输入测试消息"
          style={{ marginRight: '10px', padding: '8px', width: '300px' }}
        />
        <button
          onClick={testStreaming}
          style={{ padding: '8px 16px' }}
          disabled={!streamingSupported || store.isLoading}
        >
          {store.isLoading ? '发送中...' : '测试流式响应'}
        </button>
      </div>

      <div
        style={{
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <LLMBox store={store} />
      </div>

      {store.error && (
        <div
          style={{
            color: 'red',
            marginTop: '10px',
            padding: '10px',
            background: '#ffe6e6',
          }}
        >
          错误: {store.error}
        </div>
      )}

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h4>测试说明:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>输入消息后点击&quot;测试流式响应&quot;按钮</li>
          <li>如果配置了正确的OpenAI API密钥，将看到流式响应效果</li>
          <li>消息会逐字显示，并有闪烁光标指示正在输入</li>
          <li>完成后显示时间戳</li>
        </ul>
      </div>
    </div>
  );
});

export default StreamingTest;
