import { Checkbox, Input, makeStyles } from '@fluentui/react-components';
import { Field } from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EDITOR_FONT_FAMILY,
  EDITOR_FONT_SIZE,
  EDITOR_MODE,
  EDITOR_WORD_WRAP,
  MAX_OPEN_TABS,
} from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('EditorPanel');

const useStyles = makeStyles({
  input: {
    width: '100%',
    '& .fui-Input': {
      width: '100%',
    },
  },
});
const EditorPanel = observer(function EditorPanel() {
  const styles = useStyles();
  const { t } = useTranslation('setting');
  const mode = stores.settingStore.settings[EDITOR_MODE];
  const toggleVIMMode = () => {
    stores.settingStore.update(
      EDITOR_MODE,
      mode === 'VIM_MODE' ? 'NORMAL_MODE' : 'VIM_MODE',
    );
  };
  const family =
    (stores.settingStore.settings[EDITOR_FONT_FAMILY] as string) ||
    'Source Han Sans, Noto, Droid Sans Mono, monospace, Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, WenQuanYi Micro Hei, Arial, sans-serif';

  const setFamily = (val: string) => {
    stores.settingStore.update(EDITOR_FONT_FAMILY, val);
  };

  const fontSize = stores.settingStore.settings[EDITOR_FONT_SIZE];
  const setFontSize = (val: string) => {
    logger.debug('Setting font size', { fontSize: val });
    stores.settingStore.update(EDITOR_FONT_SIZE, parseInt(val, 10));
  };

  const wordWrapConfig =
    stores.settingStore.settings[EDITOR_WORD_WRAP] || 'off';
  const wordWrap = wordWrapConfig as 'on' | 'off';

  const toggleWordWrap = () => {
    stores.settingStore.update(
      EDITOR_WORD_WRAP,
      wordWrap === 'on' ? 'off' : 'on',
    );
  };

  const maxOpenTabs = stores.settingStore.settings[MAX_OPEN_TABS];
  const setMaxOpenTabs = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      stores.settingStore.update(MAX_OPEN_TABS, num);
    }
  };
  return (
    <div>
      <Field>
        <Checkbox
          label={t('wordWrap')}
          checked={wordWrap === 'on'}
          onChange={toggleWordWrap}
        />
      </Field>
      <Field>
        <Checkbox
          label={t('vimMode')}
          checked={mode === 'VIM_MODE'}
          onChange={toggleVIMMode}
        />
      </Field>
      <Field className={styles.input} label={t('fontSize')}>
        <Input
          defaultValue={(fontSize as string) || '14'}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </Field>
      <Field className={styles.input} label={t('fontFamily')}>
        <Input
          defaultValue={family}
          onChange={(e) => setFamily(e.target.value)}
        />
      </Field>
      <Field className={styles.input} label={t('maxOpenTabs')}>
        <Input
          type="number"
          min="1"
          defaultValue={(maxOpenTabs as string) || '10'}
          onChange={(e) => setMaxOpenTabs(e.target.value)}
        />
      </Field>
    </div>
  );
});

export default EditorPanel;
