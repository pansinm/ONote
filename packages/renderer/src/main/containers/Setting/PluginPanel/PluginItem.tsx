import React, { useState } from 'react';
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from '@fluentui/react-components';
import {
  Button,
  Caption1,
  makeStyles,
  shorthands,
  Text,
} from '@fluentui/react-components';
import { ArrowDownloadRegular, ArrowSyncRegular } from '@fluentui/react-icons';
import type { IPlugin } from '../../../services/pluginManager';
import pluginManager from '../../../services/pluginManager';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('PluginItem');

interface PluginItemProps {
  plugin: IPlugin;
  // logo: string;
  onInstalled?(plugin: IPlugin): void;
  onUninstalled?(plugin: IPlugin): void;
}

const useStyles = makeStyles({
  card: {
    width: '400px',
  },
  preview: {
    ...shorthands.padding('0px', '15px'),
  },
});

function PluginItem({ plugin, onInstalled, onUninstalled }: PluginItemProps) {
  const [installing, setInstalling] = useState(false);
  const styles = useStyles();

  return (
    <Card size="large" className={styles.card}>
      <CardHeader
        // image={{ as: 'img', src: props.logo }}
        header={<Text weight="semibold">{plugin.title}</Text>}
        description={<Caption1>{plugin.name}</Caption1>}
        action={
          plugin.state === 'installed' && !plugin.hasUpdate ? (
            <>
              <Button disabled>已安装</Button>
              <Button
                onClick={() => {
                  pluginManager
                    .uninstall(plugin.name)
                    .then(() => logger.debug('Plugin uninstalled', { plugin }))
                    .then(() => onUninstalled?.(plugin));
                }}
              >
                卸载
              </Button>
            </>
          ) : (
            <Button
              disabled={installing}
              appearance="primary"
              icon={
                plugin.hasUpdate ? (
                  <ArrowSyncRegular />
                ) : (
                  <ArrowDownloadRegular />
                )
              }
              onClick={() => {
                setInstalling(true);
                pluginManager
                  .install(plugin.downloadUrl)
                  .then(() => {
                    onInstalled?.(plugin);
                  })
                  .finally(() => setInstalling(true));
                // todo
              }}
            />
          )
        }
      />
      <CardPreview className={styles.preview}>
        <Caption1>{plugin.description}</Caption1>
      </CardPreview>
      <CardFooter>
        <Caption1>{plugin.author}</Caption1>
      </CardFooter>
    </Card>
  );
}

export default PluginItem;
