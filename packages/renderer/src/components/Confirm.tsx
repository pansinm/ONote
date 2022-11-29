import type { FC } from 'react';
import { useEffect, useState } from 'react';
import React from 'react';
import { Button, FluentProvider } from '@fluentui/react-components';
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
      <FluentProvider>
        <Flex
          justifyContent={'space-between'}
          flexDirection="column"
          paddingTop={10}
        >
          <div>{children}</div>
          <Flex justifyContent={'center'} marginTop={10} alignItems="center">
            <Button
              style={{ marginRight: 10 }}
              appearance="primary"
              onClick={() => onOk?.()}
            >
              确定
            </Button>
            {showCancelButton ? (
              <Button appearance="secondary" onClick={onCancel}>
                取消
              </Button>
            ) : null}
          </Flex>
        </Flex>
      </FluentProvider>
    </Modal>
  );
};

export default Confirm;
