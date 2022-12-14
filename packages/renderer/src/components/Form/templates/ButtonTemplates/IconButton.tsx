import React from 'react';
import { Button } from '@fluentui/react-components';
import type { IconButtonProps } from '@rjsf/utils';
import {
  ArrowDown16Regular,
  ArrowUp16Regular,
  Delete16Regular,
} from '@fluentui/react-icons';

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
  return (
    <FluentIconButton
      title="Move down"
      {...props}
      icon={<ArrowDown16Regular />}
    />
  );
}

export function MoveUpButton(props: IconButtonProps) {
  return (
    <FluentIconButton title="Move up" {...props} icon={<ArrowUp16Regular />} />
  );
}

export function RemoveButton(props: IconButtonProps) {
  return (
    <FluentIconButton title="Remove" {...props} icon={<Delete16Regular />} />
  );
}
