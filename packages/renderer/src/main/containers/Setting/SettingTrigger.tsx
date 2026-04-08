import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  makeStyles,
} from '@fluentui/react-components';
import {
  DismissRegular,
  SettingsRegular,
} from '@fluentui/react-icons';
import React from 'react';
import Setting from './Setting';

const useStyles = makeStyles({
  dismissIcon: {
    position: 'absolute',
    top: '5px',
    right: '5px',
  },
});
export default function SettingTrigger() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <Button
        icon={<SettingsRegular />}
        onClick={() => setOpen(!open)}
        appearance="subtle"
        shape="square"
      ></Button>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(_e, { open: needOpen }) => setOpen(needOpen)}
    >
      <DialogTrigger>
        <Button icon={<SettingsRegular />} shape="square"></Button>
      </DialogTrigger>
      <DialogSurface style={{ height: '70%', minWidth: '70%' }}>
        <DialogTrigger>
          <Button
            className={styles.dismissIcon}
            icon={<DismissRegular />}
            appearance="transparent"
          ></Button>
        </DialogTrigger>
        <DialogBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Setting />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
