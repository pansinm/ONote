import type { FC } from 'react';
import React, { useState, useCallback } from 'react';
import Toast from '../components/Toast';
import type { ToastItem } from '../components/Toast';

interface ShowToastParam {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  duration?: number;
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((param: ShowToastParam) => {
    const id = Date.now().toString();
    const { message, type = 'info', duration = 3000 } = param;

    const newToast: ToastItem = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const WrappedToast: FC = () => <Toast items={toasts} onDismiss={dismissToast} />;
  WrappedToast.displayName = 'WrappedToast';

  return {
    showToast,
    Toast: WrappedToast,
  };
}

export default useToast;
