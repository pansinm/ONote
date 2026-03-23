import React from 'react';
import {
  Dropdown,
  Option,
  Field,
  makeStyles,
} from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import stores from '../../stores';
import type { SupportedLocale } from '/@/shared/i18n';

const useStyles = makeStyles({
  container: {
    padding: '20px',
    maxWidth: '400px',
  },
  field: {
    marginBottom: '16px',
  },
});

const GeneralPanel: React.FC = observer(() => {
  const styles = useStyles();
  const { t } = useTranslation('setting');
  const { i18nStore } = stores;

  const handleLanguageChange = (
    _event: React.MouseEvent | React.KeyboardEvent,
    data: { optionValue?: string },
  ) => {
    if (data.optionValue) {
      i18nStore.setLanguage(data.optionValue as SupportedLocale);
    }
  };

  return (
    <div className={styles.container}>
      <Field
        label={t('language')}
        hint={t('languageDesc')}
        className={styles.field}
      >
        <Dropdown
          value={i18nStore.currentLanguage}
          onOptionSelect={handleLanguageChange}
        >
          <Option value="zh-CN">{t('zhCN')}</Option>
          <Option value="en-US">{t('enUS')}</Option>
        </Dropdown>
      </Field>
    </div>
  );
});

export default GeneralPanel;