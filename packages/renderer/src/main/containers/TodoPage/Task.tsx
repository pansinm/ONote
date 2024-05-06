import React from 'react';
import type { ITask } from '/@/main/stores/TodoStore';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';

const Task = ({ task }: { task: ITask }) => {
  const toggleDone = () => {
    stores.todoStore.updateTask(task, { done: !task.done });
  };
  return (
    <div
      style={{
        padding: '3px 5px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'start',
      }}
    >
      <div style={{ marginRight: 4 }}>
        {task.done ? (
          <Icon type="check2-circle" color="#999" onClick={toggleDone} />
        ) : (
          <Icon type="circle" color="green" onClick={toggleDone} />
        )}
      </div>
      <div>
        <div style={{ color: '#333', fontSize: 16 }}>{task.title}</div>
        {task.content ? <p style={{ color: '#666' }}>{task.content}</p> : null}
        <div>
          <span style={{ color: '#999' }}>
            {new Date(task.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default observer(Task);
