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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('setting');
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <Button
        icon={<SettingsRegular />}
        onClick={() => setOpen(!open)}
        appearance="subtle"
        shape="square"
        title={t('settings')}
        aria-label={t('settings')}
      ></Button>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(_e, { open: needOpen }) => setOpen(needOpen)}
    >
      <DialogTrigger>
        <Button icon={<SettingsRegular />} shape="square" title={t('settings')} aria-label={t('settings')}></Button>
      </DialogTrigger>
      <DialogSurface style={{ height: '80%', maxWidth: '640px', minWidth: '480px' }}>
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
