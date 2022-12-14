import React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { Checkbox } from '@fluentui/react-components';

const selectValue = (value: any, selected: any, all: any) => {
  const at = all.indexOf(value);
  const updated = selected.slice(0, at).concat(value, selected.slice(at));

  // As inserting values at predefined index positions doesn't work with empty
  // arrays, we need to reorder the updated selection to match the initial order
  return updated.sort((a: any, b: any) => all.indexOf(a) > all.indexOf(b));
};

const deselectValue = (value: any, selected: any) => {
  return selected.filter((v: any) => v !== value);
};

const CheckboxesWidget = ({
  id,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) => {
  const { enumOptions, enumDisabled, inline } = options;

  const _onChange =
    (option: any) =>
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      const all = (enumOptions as any).map(({ value }: any) => value);

      if (checked) {
        onChange(selectValue(option.value, value, all));
      } else {
        onChange(deselectValue(option.value, value));
      }
    };

  const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  return (
    <div style={{ display: 'flex', flexDirection: inline ? 'row' : 'column' }}>
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index: number) => {
          const checked = value.indexOf(option.value) !== -1;
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;

          return (
            <Checkbox
              key={option.value}
              required={required}
              checked={checked}
              type={'checkbox'}
              id={`${id}-${option.value}`}
              name={id}
              label={option.label}
              autoFocus={autofocus && index === 0}
              onChange={_onChange(option)}
              onBlur={_onBlur}
              onFocus={_onFocus}
              disabled={disabled || itemDisabled || readonly}
            />
          );
        })}
    </div>
  );
};

export default CheckboxesWidget;
