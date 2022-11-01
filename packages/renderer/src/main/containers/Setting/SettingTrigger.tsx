import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  DialogContent,
} from '@fluentui/react-components';
import { SettingsRegular } from '@fluentui/react-icons';
import React from 'react';
import Setting from './Setting';

export default function SettingTrigger() {
  return (
    <Dialog
    // open={props.open}
    // onOpenChange={(e, { open: needOpen }) => props.onOpenChange(needOpen)}
    >
      <DialogTrigger>
        <Button icon={<SettingsRegular />} shape="square"></Button>
      </DialogTrigger>
      <DialogSurface style={{ height: '70%', minWidth: '80%' }}>
        <DialogBody>
          <Setting />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
