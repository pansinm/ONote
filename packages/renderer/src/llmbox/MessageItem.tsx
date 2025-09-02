import React from 'react';
import type { Message } from './types';
import styles from './MessageItem.module.scss';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div className={styles.textContent}>{message.content}</div>
        <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageItem;
