import React from 'react';
import { SelectField } from '@fluentui/react-components/unstable';
import type { WidgetProps } from '@rjsf/utils';
import { processSelectValue } from '@rjsf/utils';
import _pick from 'lodash/pick';
import type { SelectOnChangeData } from '@fluentui/react-select';

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

  const _onChange = (
    _ev?: React.FormEvent<HTMLElement>,
    item?: SelectOnChangeData,
  ) => {
    if (!item) {
      return;
    }
    if (multiple) {
      const valueOrDefault = value || [];
      if (item.value) {
        onChange([...valueOrDefault, item.value]);
      } else {
        onChange(valueOrDefault.filter((key: any) => key !== item.value));
      }
    } else {
      onChange(processSelectValue(schema, item.value, options));
    }
  };
  const _onBlur = (e: any) =>
    onBlur(id, processSelectValue(schema, e.target.value, options));

  const _onFocus = (e: any) =>
    onFocus(id, processSelectValue(schema, e.target.value, options));

  const newOptions = (enumOptions as { value: any; label: any }[]).map(
    (option) => ({
      key: option.value,
      text: option.label,
      disabled: ((enumDisabled as any[]) || []).indexOf(option.value) !== -1,
    }),
  );

  const uiProps = _pick((options.props as object) || {}, allowedProps);
  return (
    <SelectField
      id={id}
      multiple={multiple}
      defaultValue={multiple ? value : undefined}
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
    </SelectField>
  );
};

export default SelectWidget;
