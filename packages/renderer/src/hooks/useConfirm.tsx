import React, { useEffect, useMemo, useRef } from 'react';
import { useCallback, useState } from 'react';
import Confirm from '../components/Confirm';

type ShowParam = {
  title?: string;
  content?: React.ReactNode;
  showCancelButton?: boolean;
  shouldCloseOnEsc?: boolean;
};

function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [param, setParam] = useState<ShowParam>({});
  const ref = useRef<{ resolve?(isOk: boolean): void; reject?(): void }>({});
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Escape：关闭对话框，返回 false（取消）
      if (e.key === 'Escape') {
        e.stopPropagation();
        ref.current.resolve?.(false);
        setIsOpen(false);
      }
      // 注意：不再全局监听 Enter。
      // Enter 确认由 OK 按钮的 autoFocus + 浏览器原生行为完成。
      // 当 Confirm 内容包含输入框（Prompt）时，输入框拿到焦点，
      // Enter 由输入框消费，不会误触 Confirm。
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen]);
  const WrappedConfirm = useCallback(() => {
    return (
      <Confirm
        title={param.title}
        isOpen={isOpen}
        shouldCloseOnEsc={param.shouldCloseOnEsc}
        onOk={function (): void {
          ref.current.resolve?.(true);
          setIsOpen(false);
        }}
        onCancel={function (): void {
          ref.current.resolve?.(false);
          setIsOpen(false);
        }}
      >
        {param.content || null}
      </Confirm>
    );
  }, [isOpen]);

  const open = useCallback((param: ShowParam): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      ref.current = { resolve, reject };
      setParam(param);
      setIsOpen(true);
    });
  }, []);

  return useMemo(
    () => ({
      open,
      Confirm: WrappedConfirm,
    }),
    [WrappedConfirm],
  );
}

export default useConfirm;
