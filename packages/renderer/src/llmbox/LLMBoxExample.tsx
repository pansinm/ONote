import React from 'react';
import LLMBox from './LLMBox';
import { useLLMChat } from './useLLMChat';
import styles from './LLMBoxExample.module.scss';

const LLMBoxExample: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useLLMChat({
    // 在实际使用中，这里应该从配置或环境变量中获取API密钥
    apiKey: 'process.env.OPENAI_API_KEY',
    model: 'gpt-3.5-turbo',
  });

  return (
    <div className={styles.exampleContainer}>
      <div className={styles.header}>
        <h2>LLMBox 大模型对话窗口</h2>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.chatContainer}>
        <LLMBox
          onSendMessage={sendMessage}
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      <div className={styles.instructions}>
        <h3>使用说明：</h3>
        <ul>
          <li>在输入框中输入消息，按Enter发送</li>
          <li>按Shift+Enter可以换行</li>
          <li>支持粘贴图片或拖拽图片到输入框</li>
          <li>点击📎按钮可以上传图片</li>
          <li>左侧显示模型回复，右侧显示用户消息</li>
        </ul>

        <h3>配置说明：</h3>
        <p>
          需要设置OpenAI API密钥才能使用完整功能。 请在环境变量中设置{' '}
          <code>OPENAI_API_KEY</code> 或在代码中配置。
        </p>
      </div>
    </div>
  );
};

export default LLMBoxExample;
