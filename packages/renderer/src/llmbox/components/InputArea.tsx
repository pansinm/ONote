import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './InputArea.module.scss';
import { observer } from 'mobx-react-lite';
import Icon from '/@/components/Icon';

interface InputAreaProps {
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  isLoading: boolean;
  selection?: string;
  onClearSelection?: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
  selection,
  onClearSelection,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokeImageUrls = useCallback((urls: string[]) => {
    urls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Failed to revoke object URL:', url);
      }
    });
  }, []);

  const handleSend = useCallback(async () => {
    if ((!inputValue.trim() && imageUrls.length === 0) || isLoading) return;
    try {
      await onSendMessage(
        inputValue.trim(),
        imageUrls.length > 0 ? imageUrls : undefined,
      );
      revokeImageUrls(imageUrls);
      setInputValue('');
      setImageUrls([]);
    } catch (error) {
      console.error('[InputArea] Failed to send message', error);
    }
  }, [inputValue, imageUrls, isLoading, onSendMessage, revokeImageUrls]);

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
          try {
            const url = URL.createObjectURL(file);
            setImageUrls((prev) => [...prev, url]);
          } catch (error) {
            console.error('[InputArea] Failed to create object URL from paste:', error);
          }
        }
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      const newUrls: string[] = [];
      imageFiles.forEach((file) => {
        try {
          const url = URL.createObjectURL(file);
          newUrls.push(url);
        } catch (error) {
          console.error('[InputArea] Failed to create object URL from drop:', error);
        }
      });
      if (newUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...newUrls]);
      }
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newUrls: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          try {
            const url = URL.createObjectURL(file);
            newUrls.push(url);
          } catch (error) {
            console.error('[InputArea] Failed to create object URL from file:', error);
          }
        }
      });
      if (newUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...newUrls]);
      }
      e.target.value = '';
    },
    [],
  );

  const removeImage = useCallback(
    (index: number) => {
      setImageUrls((prev) => {
        const newUrls = [...prev];
        const urlToRemove = newUrls[index];
        if (urlToRemove) {
          try {
            URL.revokeObjectURL(urlToRemove);
          } catch (e) {
            console.warn('Failed to revoke object URL:', urlToRemove);
          }
        }
        newUrls.splice(index, 1);
        return newUrls;
      });
    },
    [],
  );

  useEffect(() => {
    return () => {
      revokeImageUrls(imageUrls);
    };
  }, [imageUrls, revokeImageUrls]);

  return (
    <div className={styles.inputArea}>
      {selection && (
        <div className={styles.selectionContainer}>
          <div className={styles.selectionHeader}>
            <span style={{ fontSize: '12px', color: '#666' }}>选中文本</span>
            <button
              type="button"
              className={styles.clearSelection}
              onClick={onClearSelection}
              title="清除选中"
            >
              <Icon type="x" size={14} />
            </button>
          </div>
          <pre className={styles.selectionContent}>{selection}</pre>
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className={styles.imagePreviews}>
          {imageUrls.map((url, index) => (
            <div key={url} className={styles.imagePreview}>
              <img src={url} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className={styles.removeImage}
                onClick={() => removeImage(index)}
              >
                <Icon type="x" size={12} />
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
            title="添加图片"
          >
            <Icon type="paperclip" size={16} />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={
              (!inputValue.trim() && imageUrls.length === 0) || isLoading
            }
            className={styles.sendButton}
          >
            {isLoading ? (
              <Icon type="arrow-repeat" size={14} className={styles.spinIcon} />
            ) : (
              '发送'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(InputArea);
