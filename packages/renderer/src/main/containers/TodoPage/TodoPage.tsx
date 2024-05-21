import React, { useEffect, useState } from 'react';
import stores from '../../stores';
import Task from './Task';
import { observer } from 'mobx-react-lite';
import { Drawer } from '/@/components';
import type { FormProps } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import { Theme as FluentUIRCTheme } from '@rjsf/fluentui-rc';
import type { RJSFSchema, UiSchema, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type { ITask } from '../../stores/TodoStore';
import { Button, Field, Input, makeStyles } from '@fluentui/react-components';
import TagSelector from './TagSelector';
import Filter from './Filter';
import TagCreateForm from './TagCreateForm';
import { isEqual } from 'lodash';

const Form = withTheme(FluentUIRCTheme);

const TagsField = function (props: WidgetProps) {
  const selectedOptions: string[] = props.value || [];
  return (
    <Field
      label={props.schema.title}
      style={{
        maxWidth: 400,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          columnGap: '3px',
        }}
      >
        <TagSelector tags={selectedOptions} onChange={props.onChange} />
        <TagCreateForm />
      </div>
    </Field>
  );
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flex: 1,
    height: '100%',
  },
  content: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  list: {
    paddingTop: '10px',
    overflow: 'auto',
  },
  form: {
    '& .fui-Flex': {
      rowGap: '0px',
    },
  },
});

const TodoPage: React.FC = () => {
  const styles = useStyles();
  const [text, setText] = useState('');
  // const [activateTaskId, setActivateTaskId] = useState<''>;
  const [createFormData, setCreateFormData] = React.useState<Partial<ITask>>({
    title: '',
    tags: stores.todoStore.filter.tags,
  });

  const [currentTaskId, setCurrentTaskId] = useState('');
  const [editFormData, setEditFormData] = React.useState<Partial<ITask>>({
    title: '',
    tags: stores.todoStore.filter.tags,
  });

  const [open, setOpen] = useState(true);

  const createTask = () => {
    stores.todoStore.createTask(text, createFormData);
    setText('');
    setCreateFormData({ ...createFormData, title: '' });
    setCurrentTaskId('');
  };

  const activateTask = (task: ITask) => {
    setOpen(true);
    setCurrentTaskId(task.id);
    setEditFormData({ ...task });
  };

  useEffect(() => {
    setCreateFormData({ ...createFormData, title: text });
  }, [text]);

  const handleSubmit: FormProps['onSubmit'] = ({ formData }) => {
    if (currentTaskId) {
      stores.todoStore.updateTask(currentTaskId, formData as ITask);
      return;
    }
    if (createFormData.title) {
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
      dueDate: {
        type: 'string',
        title: '截止日期',
        format: 'date',
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
      'ui:widget': TagsField,
    },
  };

  const formData = currentTaskId ? editFormData : createFormData;
  const handleChange = (nextFormData: typeof editFormData) => {
    if (currentTaskId) {
      const nextTags = [...(nextFormData?.tags || [])];
      const currentTags = [...(editFormData?.tags || [])];
      const needSubmit =
        !isEqual(nextTags, currentTags) ||
        !isEqual(nextFormData.dueDate, editFormData.dueDate);
      setEditFormData({ ...nextFormData });
      if (needSubmit) {
        stores.todoStore.updateTask(currentTaskId, nextFormData);
      }
      return;
    }
    setCreateFormData(nextFormData);
  };
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div>
          <Input
            style={{ width: '100%' }}
            placeholder="创建任务"
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
              setCurrentTaskId('');
            }}
          />
          <Filter />
        </div>
        <div className={styles.list}>
          {stores.todoStore.tasks.map((task) => (
            <Task
              key={task.id}
              activated={task.id === currentTaskId}
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
        title={currentTaskId ? '编辑任务' : '新建任务'}
      >
        <Form
          className={styles.form}
          formData={formData}
          onChange={({ formData }) => handleChange(formData)}
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
