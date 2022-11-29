import React, { useState } from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import PluginManager from './PluginPanel/PluginManager';
import EditorPanel from './EditorPanel';
import PlantUMLPanel from './PlantUMLPanel';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  tabList: {
    width: '120px',
    ...shorthands.padding('10px', '5px'),
    ...shorthands.borderRight('1px', 'solid'),
  },
  panel: {
    paddingLeft: '10px',
  },
});

export default function Setting() {
  const styles = useStyles();
  const [tab, setTab] = useState('editor');
  return (
    <div className={styles.root}>
      <TabList
        className={styles.tabList}
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
        vertical
      >
        <Tab value="editor">编辑器</Tab>
        <Tab value="plantuml">PlantUML</Tab>
        <Tab value="plugin">插件管理</Tab>
        <Tab value="test">test</Tab>
      </TabList>
      <div className={styles.panel}>
        {tab === 'editor' && <EditorPanel />}
        {tab === 'plantuml' && <PlantUMLPanel />}
        {tab === 'plugin' && <PluginManager />}
        {tab === 'test' && (
          <Form
            schema={{
              title: 'A registration form',
              description: 'A simple form example. Demonstrating ui options',
              type: 'object',
              required: ['firstName', 'lastName'],
              properties: {
                firstName: {
                  type: 'string',
                  title: 'First name',
                  default: 'Chuck',
                },
                lastName: {
                  type: 'string',
                  title: 'Last name',
                },
                telephone: {
                  type: 'string',
                  title: 'Telephone',
                  minLength: 10,
                },
              },
            }}
            validator={validator}
          />
        )}
      </div>
    </div>
  );
}
