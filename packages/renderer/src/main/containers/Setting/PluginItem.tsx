import React from 'react';
import { Card, CardHeader } from '@fluentui/react-components/unstable';
import { Button, Caption1, Text } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';

interface PluginItemProps {
  name: string;
  installed: boolean;
  description: string;
  logo: string;
  onInstall(name: string): void;
}

function PluginiItem(props: PluginItemProps) {
  return (
    <Card>
      <CardHeader
        image={{ as: 'img', src: props.logo }}
        header={<Text weight="semibold">{props.name}</Text>}
        description={<Caption1>{props.description}</Caption1>}
        action={
          props.installed ? null : (
            <Button
              appearance="primary"
              icon={<ArrowDownloadRegular />}
              onClick={() => {
                // todo
              }}
            />
          )
        }
      />
    </Card>
  );
}

export default PluginiItem;
