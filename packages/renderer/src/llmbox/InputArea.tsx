import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './InputArea.module.scss';
import { observer } from 'mobx-react-lite';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('InputArea');

interface InputAreaProps {
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  isLoading: boolean;
  selection?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
  selection,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  logger.debug('InputArea rendered', { selection });

  const handleSend = useCallback(async () => {
    if ((!inputValue.trim() && imageUrls.length === 0) || isLoading) return;
    try {
      await onSendMessage(
        inputValue.trim(),
        imageUrls.length > 0 ? imageUrls : undefined,
      );
      setInputValue('');
      setImageUrls([]);
    } catch (error) {
      logger.error('Failed to send message', error);
    }
  }, [inputValue, imageUrls, isLoading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          setImageUrls((prev) => [...prev, url]);
        }
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      const newUrls = imageFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/'),
      );
      const newUrls = imageFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    },
    [],
  );

  const removeImage = useCallback((index: number) => {
    setImageUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className={styles.inputArea}>
      {/* 显示引用内容区域 */}
      {selection && (
        <div className={styles.selectionContainer}>
          <pre className={styles.selectionContent}>{selection}</pre>
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className={styles.imagePreviews}>
          {imageUrls.map((url, index) => (
            <div key={index} className={styles.imagePreview}>
              <img src={url} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className={styles.removeImage}
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.inputContainer}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          placeholder="输入内容..."
          disabled={isLoading}
          className={styles.textInput}
          rows={1}
        />
        <div className={styles.actions}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className={styles.fileInput}
            accept="image/*"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={styles.attachButton}
          >
            📎
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={
              (!inputValue.trim() && imageUrls.length === 0) || isLoading
            }
            className={styles.sendButton}
          >
            {isLoading ? '⏳' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(InputArea);
