import React, { useEffect, useState } from 'react';
import stores from '../../stores';
import Task from './Task';
import { observer } from 'mobx-react-lite';
import { Drawer } from '/@/components';
import { withTheme } from '@rjsf/core';
import { Theme as FluentUIRCTheme } from '@rjsf/fluentui-rc';
import type { RJSFSchema, UiSchema, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type { ITask } from '../../stores/TodoStore';
import { Button, Field, Input, makeStyles } from '@fluentui/react-components';
import TagSelector from './TagSelector';
import Filter from './Filter';
import TagCreateForm from './TagCreateForm';

const Form = withTheme(FluentUIRCTheme);

const TagsField = function (props: WidgetProps) {
  const selectedOptions: string[] = props.value || [];
  return (
    <Field label={props.schema.title} style={{ maxWidth: 400 }}>
      <TagSelector tags={selectedOptions} onChange={props.onChange} />
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
      'ui:widget': TagsField,
    },
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
              const form = formData.id ? {} : formData;
              setFormData({ ...form, title: text });
              setOpen(true);
            }}
          />
          <Filter />
        </div>
        <div className={styles.list}>
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
          className={styles.form}
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
