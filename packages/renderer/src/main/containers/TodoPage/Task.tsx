import React from 'react';
import type { ITask } from '/@/main/stores/TodoStore';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';
import {
  Tag,
  TagGroup,
  makeStyles,
  mergeClasses,
  shorthands,
} from '@fluentui/react-components';
import { createTagColorStyle } from '/@/common/utils/style';

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: '#eee',
    },
    '&:hover .delete': {
      visibility: 'visible',
    },
    ...shorthands.padding('3px', '5px'),
    ...shorthands.borderBottom('1px', 'solid', '#eee'),
    ...shorthands.margin('4px', 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activated: {
    backgroundColor: '#eee',
  },
  delete: {
    visibility: 'hidden',
    color: '#999',
    '&:hover': {
      color: 'red !important',
    },
  },
  tagItem: {
    ...shorthands.margin('4px'),
    '& span': {
      ...shorthands.padding('0'),
    },
  },
});

function formatTime(timestamp: number) {
  const now = new Date();
  const target = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  if (target >= todayStart) {
    // 今天
    return `今天 ${target.getHours().toString().padStart(2, '0')}:${target
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  } else if (target >= yesterdayStart) {
    // 昨天
    return '昨天';
  } else {
    // 其他日期
    return `${target.getFullYear()}-${(target.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${target.getDate().toString().padStart(2, '0')}`;
  }
}

const Task = ({
  task,
  onClick,
  activated,
}: {
  task: ITask;
  onClick: () => void;
  activated: boolean;
}) => {
  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    stores.todoStore.updateTask(task, { done: !task.done });
  };
  const styles = useStyles();
  return (
    <div
      className={mergeClasses(styles.root, activated && styles.activated)}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ marginRight: 4 }}>
          {task.done ? (
            <Icon type="check2-circle" color="#999" onClick={toggleDone} />
          ) : (
            <Icon type="circle" color="green" onClick={toggleDone} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: task.done ? '#666' : '#333',
              fontSize: 16,
              textDecoration: task.done ? 'line-through' : undefined,
            }}
          >
            {task.title}
            <TagGroup>
              {task.tags?.map((name) => (
                <Tag
                  key={name}
                  value={name}
                  className={styles.tagItem}
                  style={createTagColorStyle(
                    name,
                    stores.todoStore.tagRecords[name]?.color,
                  )}
                  size="small"
                  shape="rounded"
                >
                  {name}
                </Tag>
              ))}
            </TagGroup>
          </div>
          {task.description ? (
            <p style={{ color: '#666' }}>{task.description}</p>
          ) : null}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ color: '#999' }}>
                创建时间: {formatTime(task.createdAt)}
              </span>
            </div>
            {task.done ? (
              <span style={{ color: '#999' }}>
                完成时间: {formatTime(task.doneAt)}
              </span>
            ) : null}
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
