import React, { useEffect, useState } from 'react';
import styles from './TodoPage.module.scss';
import stores from '../../stores';
import Task from './Task';
import { observer } from 'mobx-react-lite';
import { Drawer } from '/@/components';
import { withTheme } from '@rjsf/core';
import { Theme as FluentUIRCTheme } from '@rjsf/fluentui-rc';
import type { RJSFSchema, UiSchema, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type { ITask } from '../../stores/TodoStore';
import { Button, Field, Input, Tag } from '@fluentui/react-components';
import {
  TagPicker,
  TagPickerList,
  TagPickerInput,
  TagPickerControl,
  TagPickerProps,
  TagPickerOption,
  TagPickerGroup,
} from '@fluentui/react-tag-picker-preview';
import { createTagColorStyle } from '/@/common/utils/style';

const Form = withTheme(FluentUIRCTheme);

const TagSelector = function (props: WidgetProps) {
  const tagPickerOptions: string[] = (props.schema.items! as any).enum;
  const selectedOptions: string[] = props.value || [];
  return (
    <Field label={props.schema.title} style={{ maxWidth: 400 }}>
      <TagPicker
        size="medium"
        onOptionSelect={(_, { selectedOptions }) => {
          props.onChange(selectedOptions);
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
          <TagPickerInput />
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
            : 'No options available'}
        </TagPickerList>
      </TagPicker>
    </Field>
  );
};

const TodoPage: React.FC = () => {
  const [text, setText] = useState('');
  // const [activateTaskId, setActivateTaskId] = useState<''>;
  const [formData, setFormData] = React.useState<Partial<ITask>>({ title: '' });
  const [open, setOpen] = useState(false);

  const createTask = () => {
    stores.todoStore.createTask(text, formData);
    setText('');
    setFormData({ title: '' });
  };

  const activateTask = (task: ITask) => {
    setOpen(true);
    setFormData({ ...task });
  };

  useEffect(() => {
    setFormData({ ...formData, title: text });
  }, [text]);

  const handleSubmit = () => {
    if (formData.id) {
      const task = stores.todoStore.tasksById[formData.id];
      stores.todoStore.updateTask(task, formData as ITask);
      return;
    }
    if (formData.title) {
      createTask();
    }
  };

  const jsonSchema: RJSFSchema = {
    required: ['title'],
    properties: {
      title: {
        type: 'string',
        title: '名称',
        default: '',
      },
      tags: {
        type: 'array',
        title: '标签',
        items: {
          type: 'string',
          enum: stores.todoStore.tags.map((tag) => tag.name),
        },
        uniqueItems: true,
      },
      description: {
        type: 'string',
        title: '描述',
        default: '',
      },
    },
  };

  const uiSchema: UiSchema = {
    title: {},
    description: {
      'ui:widget': 'textarea',
      'ui:options': {
        rows: 5,
      },
    },
    tags: {
      'ui:widget': TagSelector,
    },
  };

  return (
    <div className={styles.TodoPage}>
      <div className={styles.Content}>
        <div>
          <Input
            style={{ width: '100%' }}
            placeholder="输入任务"
            value={text}
            size="medium"
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createTask();
              }
            }}
            onFocus={() => {
              const form = formData.id ? {} : formData;
              setFormData({ ...form, title: text });
              setOpen(true);
            }}
          />
        </div>
        <div className={styles.TodoList}>
          {stores.todoStore.tasks.map((task) => (
            <Task
              key={task.id}
              activated={task.id === formData.id}
              task={task}
              onClick={() => activateTask(task)}
            />
          ))}
        </div>
      </div>
      <Drawer
        type="inline"
        open={open}
        setOpen={setOpen}
        position="end"
        title={formData.id ? '任务详情' : '新建任务'}
      >
        <Form
          formData={formData}
          onChange={({ formData }) => setFormData(formData)}
          schema={jsonSchema}
          uiSchema={uiSchema}
          validator={validator}
          onSubmit={handleSubmit}
        >
          <Button appearance="primary" type="submit">
            提交
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default observer(TodoPage);
