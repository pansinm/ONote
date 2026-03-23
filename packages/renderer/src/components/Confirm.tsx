import type { FC } from 'react';
import React from 'react';
import { Button, FluentProvider } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import Flex from './Flex';
import Modal from './Modal';

type ConfirmProps = {
  isOpen: boolean;
  title?: string;
  shouldCloseOnEsc?: boolean;
  showCancelButton?: boolean;
  onOk(): void;
  onCancel(): void;
  children?: React.ReactNode;
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
  const { t } = useTranslation('common');
  return (
    <Modal
      isOpen={isOpen}
      title={title || t('tip')}
      shouldCloseOnEsc={shouldCloseOnEsc}
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
              {t('confirm')}
            </Button>
            {showCancelButton ? (
              <Button appearance="secondary" onClick={onCancel}>
                {t('cancel')}
              </Button>
            ) : null}
          </Flex>
        </Flex>
      </FluentProvider>
    </Modal>
  );
};

export default Confirm;
