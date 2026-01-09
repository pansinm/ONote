import React from 'react';

import { RadioGroup } from '@fluentui/react-components';
import type { WidgetProps } from '@rjsf/utils';
import { Radio } from '@fluentui/react-components';

const RadioWidget = ({
  id,
  schema,
  options,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options;

  const _onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    onChange(schema.type == 'boolean' ? value !== 'false' : value);
  const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  const inline = Boolean(options && options.inline);

  return (
    <RadioGroup
      required={required}
      orientation={inline ? 'horizontal' : 'vertical'}
    >
      {Array.isArray(enumOptions) &&
        enumOptions.map((option) => {
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          const checked = option.value == value;

          const radio = (
            <Radio
              label={option.label}
              id={`${id}-${option.value}`}
              key={option.value}
              name={id}
              type="radio"
              disabled={disabled || itemDisabled || readonly}
              checked={checked}
              required={required}
              value={option.value}
              onChange={_onChange}
              onBlur={_onBlur}
              onFocus={_onFocus}
            />
          );
          return radio;
        })}
    </RadioGroup>
  );
};

export default RadioWidget;
