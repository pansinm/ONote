import React, { useMemo, useRef } from 'react';
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
