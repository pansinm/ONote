import React from 'react';
import stores from '../../stores';
import type { WidgetProps } from '@rjsf/utils';
import { Field, Tag } from '@fluentui/react-components';
import {
  TagPicker,
  TagPickerList,
  TagPickerInput,
  TagPickerControl,
  TagPickerOption,
  TagPickerGroup,
} from '@fluentui/react-tag-picker-preview';
import { createTagColorStyle } from '/@/common/utils/style';
import { observer } from 'mobx-react-lite';
import TagCreateForm from './TagCreateForm';

interface TagSelectorProps {
  onChange(tags: string[]): void;
  tags: string[];
}

const TagSelector = function ({ onChange, tags }: TagSelectorProps) {
  const tagPickerOptions = stores.todoStore.tags.map((tag) => tag.name);
  const selectedOptions: string[] = tags;
  return (
    <TagPicker
      size="medium"
      onOptionSelect={(_, { selectedOptions }) => {
        onChange(selectedOptions);
      }}
      selectedOptions={selectedOptions}
    >
      <TagPickerControl>
        <TagPickerGroup>
          {selectedOptions.map((option) => (
            <Tag
              key={option}
              shape="rounded"
              value={option}
              style={createTagColorStyle(
                option,
                stores.todoStore.tagRecords[option]?.color,
              )}
            >
              {option}
            </Tag>
          ))}
        </TagPickerGroup>
        <TagPickerInput placeholder="选择标签" />
      </TagPickerControl>

      <TagPickerList>
        {tagPickerOptions.length > 0
          ? tagPickerOptions.map((option) => (
              <TagPickerOption
                value={option}
                key={option}
                style={createTagColorStyle(
                  option,
                  stores.todoStore.tagRecords[option]?.color,
                )}
              >
                {option}
              </TagPickerOption>
            ))
          : '没有发现标签'}
      </TagPickerList>
    </TagPicker>
  );
};

export default observer(TagSelector);
