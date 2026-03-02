import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  DialogContent,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  ClosedCaption16Regular,
  DismissRegular,
  DismissSquareFilled,
  SettingsRegular,
  ArrowExitFilled,
} from '@fluentui/react-icons';
import React from 'react';
import Setting from './Setting';

const useStyles = makeStyles({
  dismissIcon: {
    position: 'absolute',
    top: '5px',
    right: '5px',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    ...shorthands.padding('10px'),
    ...shorthands.marginTop('auto'),
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
        shape="square"
      ></Button>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(e, { open: needOpen }) => setOpen(needOpen)}
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
          <div className={styles.dialogActions}>
            <Button
              appearance="primary"
              icon={<ArrowExitFilled />}
              onClick={async () => {
                await (window as any).onote.app.invoke('quit');
              }}
            >
              退出应用
            </Button>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
