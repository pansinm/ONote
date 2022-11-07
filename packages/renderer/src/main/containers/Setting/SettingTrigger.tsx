import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  DialogContent,
  makeStyles,
} from '@fluentui/react-components';
import {
  ClosedCaption16Regular,
  DismissRegular,
  DismissSquareFilled,
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
  return (
    <Dialog
    // open={props.open}
    // onOpenChange={(e, { open: needOpen }) => props.onOpenChange(needOpen)}
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
        <DialogBody>
          <Setting />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
