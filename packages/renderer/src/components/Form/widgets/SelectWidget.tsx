import React from 'react';
import { Dropdown } from '@fluentui/react-components';
import type { WidgetProps } from '@rjsf/utils';
import type { SelectProps } from '@fluentui/react-select';
import _pick from 'lodash/pick';

// Keys of IDropdownProps from @fluentui/react
const allowedProps = [
  'placeHolder',
  'options',
  'onChange',
  'onChanged',
  'onRenderLabel',
  'onRenderPlaceholder',
  'onRenderPlaceHolder',
  'onRenderTitle',
  'onRenderCaretDown',
  'dropdownWidth',
  'responsiveMode',
  'defaultSelectedKeys',
  'selectedKeys',
  'multiselectDelimiter',
  'notifyOnReselect',
  'isDisabled',
  'keytipProps',
  'theme',
  'styles',

  // ISelectableDroppableTextProps
  'componentRef',
  'label',
  'ariaLabel',
  'id',
  'className',
  'defaultSelectedKey',
  'selectedKey',
  'multiSelect',
  'options',
  'onRenderContainer',
  'onRenderList',
  'onRenderItem',
  'onRenderOption',
  'onDismiss',
  'disabled',
  'required',
  'calloutProps',
  'panelProps',
  'errorMessage',
  'placeholder',
  'openOnKeyboardFocus',
];

const SelectWidget = ({
  schema,
  id,
  options,
  label,
  required,
  disabled,
  readonly,
  value,
  multiple,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options;

  const _onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = {
      value: e.target.value,
    };
    if (multiple) {
      const valueOrDefault = value || [];
      if (e.target.value) {
        onChange([...valueOrDefault, e.target.value]);
      } else {
        onChange(valueOrDefault.filter((key: any) => key !== e.target.value));
      }
    } else {
      onChange(item.value);
    }
  };
  const _onBlur = (e: any) =>
    onBlur(id, e.target.value);

  const _onFocus = (e: any) =>
    onFocus(id, e.target.value);

  const newOptions = (enumOptions as { value: any; label: any }[]).map(
    (option) => ({
      key: option.value,
      text: option.label,
      disabled: ((enumDisabled as any[]) || []).indexOf(option.value) !== -1,
    }),
  );

  const uiProps = _pick((options.props as object) || {}, allowedProps);
  return (
    <select
      id={id}
      multiple={multiple}
      defaultValue={multiple ? value as string[] : value as string}
      disabled={disabled}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      {...uiProps}
    >
      {newOptions.map((op) => (
        <option key={op.key} disabled={op.disabled} value={op.key}>
          {op.text}
        </option>
      ))}
    </select>
  );
};

export default SelectWidget;
