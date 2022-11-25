import { Button, makeStyles } from '@fluentui/react-components';
import React from 'react';
import PluginItem from './PluginItem';
import type { IPlugin } from '/@/main/ipc/pluginManager';

export interface IPluginMarketProps {
  plugins: IPlugin[];
  onInstalled?(plugin: IPlugin): void;
  onUninstalled?(plugin: IPlugin): void;
}

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridGap: '10px',
  },
});

export default function PluginInstalled(props: IPluginMarketProps) {
  const styles = useStyles();
  return (
    <div>
      <div className={styles.root}>
        {props.plugins.map((plugin) => (
          <PluginItem
            plugin={plugin}
            onInstalled={props.onInstalled}
            onUninstalled={props.onUninstalled}
            key={plugin.name}
          />
        ))}
      </div>
    </div>
  );
}
