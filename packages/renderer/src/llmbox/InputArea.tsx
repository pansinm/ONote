import React, { useState, useRef, useCallback } from 'react';
import styles from './InputArea.module.scss';

interface InputAreaProps {
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Failed to send message:', error);
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

  return (
    <div className={styles.inputArea}>
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
          placeholder="输入消息... (Enter发送，Shift+Enter换行)"
          disabled={isLoading}
          className={styles.textInput}
          rows={1}
        />

        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.attachButton}
            disabled={isLoading}
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

export default InputArea;
