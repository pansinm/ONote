import React from 'react';
import classNames from 'classnames';
import stores from '../../stores';
import { observer } from 'mobx-react-lite';
import { TasksApp20Regular } from '@fluentui/react-icons';
import { makeStyles, shorthands } from '@fluentui/react-components';

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

const useStyles = makeStyles({
  root: {
    ...shorthands.padding('4px', '0px'),
    // backgroundColor: 'whitesmoke',
    // box shadow on top
    boxShadow: '0 -2px 50px rgba(0, 0, 0, 0.1)',
  },

  title: {
    ...shorthands.padding('10px', '2px', '4px', '2px'),
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  },
});

const Tasks: React.FC<Props> = ({ style, className }) => {
  const styles = useStyles();
  const activateTodo = (filter: Partial<typeof stores.todoStore.filter>) => {
    stores.todoStore.activate(filter);
  };

  return (
    <div className={classNames(className, styles.root)} style={style}>
      <h4
        style={{ color: '#666' }}
        className={styles.title}
        onClick={() => activateTodo({})}
      >
        <TasksApp20Regular /> 待办清单
      </h4>
    </div>
  );
};

export default observer(Tasks);
