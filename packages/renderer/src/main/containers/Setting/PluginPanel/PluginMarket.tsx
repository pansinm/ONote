import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import PluginItem from './PluginItem';
import type { IPlugin } from '/@/main/services/pluginManager';

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

export default function PluginMarket(props: IPluginMarketProps) {
  const styles = useStyles();
  return (
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
  );
}
