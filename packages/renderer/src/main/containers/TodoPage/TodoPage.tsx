// react sfc component
import React, { useState } from 'react';
import styles from './TodoPage.module.scss';
import Input from '/@/components/Input';
import stores from '../../stores';
import Task from './Task';
import { observer } from 'mobx-react-lite';

const TodoPage: React.FC = () => {
  const [text, setText] = useState('');
  const createTask = () => {
    stores.todoStore.createTask(text);
    setText('');
  };
  return (
    <div className={styles.TodoPage}>
      <div>
        <Input
          placeholder="输入任务"
          value={text}
          onChange={setText}
          onEnter={createTask}
        />
      </div>
      <div className={styles.TodoList}>
        {stores.todoStore.tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default observer(TodoPage);
