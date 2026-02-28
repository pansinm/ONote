import type { FC } from 'react';
import React, { useEffect, useCallback } from 'react';
import { MessageBar } from '@fluentui/react-components';
import styles from './Toast.module.scss';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
}

interface ToastProps {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}

const Toast: FC<ToastProps> = ({ items, onDismiss }) => {
  const getIntent = (
    type: ToastItem['type'],
  ): 'error' | 'success' | 'info' | 'warning' => {
    return type;
  };

  return (
    <div className={styles.ToastContainer}>
      {items.map((item) => (
        <div key={item.id} className={styles.ToastItem}>
          <MessageBar intent={getIntent(item.type)}>{item.message}</MessageBar>
        </div>
      ))}
    </div>
  );
};

export default Toast;
