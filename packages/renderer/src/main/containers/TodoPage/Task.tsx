import React from 'react';
import type { ITask } from '/@/main/stores/TodoStore';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';
import { makeStyles, mergeClasses } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: '#eee',
    },
    '&:hover .delete': {
      visibility: 'visible',
    },
  },
  delete: {
    visibility: 'hidden',
    color: '#999',
    '&:hover': {
      color: 'red !important',
    },
  },
});

const Task = ({ task, onClick }: { task: ITask; onClick: () => void }) => {
  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    stores.todoStore.updateTask(task, { done: !task.done });
  };
  const styles = useStyles();
  return (
    <div
      className={styles.root}
      style={{
        padding: '3px 5px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 4 }}>
          {task.done ? (
            <Icon type="check2-circle" color="#999" onClick={toggleDone} />
          ) : (
            <Icon type="circle" color="green" onClick={toggleDone} />
          )}
        </div>
        <div>
          <div
            style={{
              color: task.done ? '#666' : '#333',
              fontSize: 16,
              textDecoration: task.done ? 'line-through' : undefined,
            }}
          >
            {task.title}
          </div>
          {task.description ? (
            <p style={{ color: '#666' }}>{task.description}</p>
          ) : null}
          <div>
            <span style={{ color: '#999' }}>
              {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <Icon
        className={mergeClasses(styles.delete, 'delete')}
        type="x"
        title="删除"
        color="#999"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          stores.todoStore.removeTask(task.id);
        }}
      />
    </div>
  );
};

export default observer(Task);
