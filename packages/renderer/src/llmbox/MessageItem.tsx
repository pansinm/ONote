import React, { useState } from 'react';
import type { Message } from './types';
import styles from './MessageItem.module.scss';
import Markdown from 'react-markdown';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [showRawContent, setShowRawContent] = useState(false);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleContentMode = () => {
    setShowRawContent(!showRawContent);
  };

  return (
    <div className={`${styles.messageItem} ${styles[message.role]}`}>
      <div className={styles.messageContent}>
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div className={styles.imageContainer}>
            {message.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className={styles.messageImage}
              />
            ))}
          </div>
        )}
        <div className={styles.textContent}>
          {message.role === 'assistant' ? (
            <>
              {showRawContent ? (
                <pre className={styles.rawContent}>{message.content}</pre>
              ) : (
                <div className={styles.markdownContent}>
                  <Markdown>{message.content}</Markdown>
                </div>
              )}
              {!message.isStreaming && (
                <button
                  className={styles.toggleButton}
                  onClick={toggleContentMode}
                  title={showRawContent ? '显示 Markdown' : '显示原始内容'}
                >
                  {showRawContent ? '📄' : '📝'}
                </button>
              )}
            </>
          ) : (
            <>
              {message.content}
              {message.isStreaming && (
                <span className={styles.streamingCursor}>▊</span>
              )}
            </>
          )}
        </div>
        {!message.isStreaming && (
          <div className={styles.timestamp}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
