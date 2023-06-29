import type { ChangeEvent } from 'react';
import React from 'react';

import type { WidgetProps } from '@rjsf/utils';
import { CheckboxField } from '@fluentui/react-components';
import type { CheckboxOnChangeData } from '@fluentui/react-components';

const CheckboxWidget = (props: WidgetProps) => {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    label,
    schema,
    autofocus,
    onChange,
    onBlur,
    onFocus,
  } = props;

  const _onChange = (
    event: ChangeEvent<HTMLInputElement>,
    data: CheckboxOnChangeData,
  ) => onChange(data.checked);
  const _onBlur = ({
    target: { checked },
  }: React.FocusEvent<HTMLInputElement>) => onBlur(id, checked);
  const _onFocus = ({
    target: { checked },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, checked);

  const desc = label || schema.description;
  return (
    <CheckboxField
      id={id}
      name={id}
      label={desc}
      checked={typeof value === 'undefined' ? false : value}
      required={required}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      onChange={_onChange}
      type="checkbox"
      onBlur={_onBlur}
      onFocus={_onFocus}
    />
  );
};

export default CheckboxWidget;
