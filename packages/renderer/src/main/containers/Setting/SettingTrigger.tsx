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
    top: '12px',
    right: '12px',
    zIndex: 1,
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
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-heading)' }}>{t('settings')}</h2>
          <Setting />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
