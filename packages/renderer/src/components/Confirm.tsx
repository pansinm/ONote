import type { FC } from 'react';
import { useEffect, useState } from 'react';
import React from 'react';
import Button from './Button';
import Flex from './Flex';
import Modal from './Modal';

type ConfirmProps = {
  isOpen: boolean;
  title?: string;
  shouldCloseOnEsc?: boolean;
  showCancelButton?: boolean;
  onOk(): void;
  onCancel(): void;
};

const Confirm: FC<ConfirmProps> = ({
  isOpen,
  onCancel,
  onOk,
  children,
  shouldCloseOnEsc = false,
  showCancelButton = true,
  title,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title || '提示'}
      shouldCloseOnEsc={shouldCloseOnEsc}
      // onRequestClose={onCancel}
    >
      <Flex
        justifyContent={'space-between'}
        flexDirection="column"
        paddingTop={10}
      >
        <div>{children}</div>
        <Flex justifyContent={'center'} alignItems="center" marginTop={10}>
          <Button color="primary" onClick={() => onOk?.()}>
            确定
          </Button>
          {showCancelButton ? (
            <Button color="secondary" onClick={onCancel}>
              取消
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default Confirm;
