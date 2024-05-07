import React from 'react';
import TagSelector from './TagSelector';
import { Select, Tab, TabList, makeStyles } from '@fluentui/react-components';
import stores from '../../stores';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabs: {
    display: 'flex',
    flex: 1,
  },
});
const Filter = () => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        <TabList
          onTabSelect={(ev, { value }) =>
            stores.todoStore.setFilterTab(value as 'all' | 'todo' | 'done')
          }
          selectedValue={stores.todoStore.filter.tab}
        >
          <Tab value="all">全部</Tab>
          <Tab value="todo">未完成</Tab>
          <Tab value="done">已完成</Tab>
        </TabList>
      </div>
      <div>
        <TagSelector
          tags={stores.todoStore.filter.tags}
          onChange={(tags) => {
            stores.todoStore.setFilterTags(tags);
          }}
        />
      </div>
      <div>
        <Select
          onChange={(ev, data) => {
            stores.todoStore.setFilterTimeRange(data.value as any);
          }}
          value={stores.todoStore.filter.timeRange}
        >
          <option value={'all'}>不限</option>
          <option value={'today'}>今天</option>
          <option value={'tomorrow'}>明天</option>
          <option value={'week'}>本周</option>
          <option value={'mouth'}>本月</option>
        </Select>
      </div>
    </div>
  );
};

export default observer(Filter);
