import { Checkbox, makeStyles } from '@fluentui/react-components';
import { InputField } from '@fluentui/react-components/unstable';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  EDITOR_FONT_FAMILY,
  EDITOR_MODE,
} from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';

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
  return (
    <div>
      <Checkbox
        label={'VIM 模式'}
        checked={mode === 'VIM_MODE'}
        onChange={toggleVIMMode}
      />
      <InputField
        className={styles.input}
        type="text"
        label="Font Family"
        defaultValue={family}
        onChange={(e) => setFamily(e.target.value)}
      />
    </div>
  );
});

export default EditorPanel;
