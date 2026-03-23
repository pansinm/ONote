import React from 'react';
import { Button } from '@fluentui/react-components';
import type { IconButtonProps } from '@rjsf/utils';
import {
  ArrowDown16Regular,
  ArrowUp16Regular,
  Delete16Regular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';

export default function FluentIconButton(props: IconButtonProps) {
  return (
    <Button
      disabled={props.disabled}
      onClick={props.onClick}
      icon={props.icon}
      color="secondary"
    />
  );
}

export function MoveDownButton(props: IconButtonProps) {
  const { t } = useTranslation('common');
  return (
    <FluentIconButton
      title={t('moveDown')}
      {...props}
      icon={<ArrowDown16Regular />}
    />
  );
}

export function MoveUpButton(props: IconButtonProps) {
  const { t } = useTranslation('common');
  return (
    <FluentIconButton title={t('moveUp')} {...props} icon={<ArrowUp16Regular />} />
  );
}

export function RemoveButton(props: IconButtonProps) {
  const { t } = useTranslation('common');
  return (
    <FluentIconButton title={t('remove')} {...props} icon={<Delete16Regular />} />
  );
}
