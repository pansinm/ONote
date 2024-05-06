import React from 'react';
import classNames from 'classnames';
import styles from './Tasks.module.scss';
import Icon from '/@/components/Icon';
import stores from '../../stores';
import { observer } from 'mobx-react-lite';

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

const Tasks: React.FC<Props> = ({ style, className }) => {
  const handleClick = () => {
    stores.todoStore.activate();
  };
  return (
    <div className={classNames(className, styles.Tasks)} style={style}>
      <h4 style={{ color: '#666' }}>
        <Icon type="list-task" size={18}></Icon> 待办
      </h4>
      <div className={styles.TimeList}>
        <div className={styles.TimeItem} onClick={handleClick}>
          全部
        </div>
        {/* <div className={styles.TimeItem} onClick={handleClick}>
          今天
        </div>
        <div className={styles.TimeItem} onClick={handleClick}>
          本周
        </div>
        <div className={styles.TimeItem} onClick={handleClick}>
          本月
        </div> */}
      </div>
      <div className={styles.TagList}>
        {/* <div className={styles.TagItem}>测试</div>
        <div className={styles.TagItem}>+标签</div> */}
      </div>
    </div>
  );
};

export default observer(Tasks);
