import { Checkbox, makeStyles } from '@fluentui/react-components';
import { InputField } from '@fluentui/react-components/unstable';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  CHATGPT_MESSAGE_CLASS_STARTS_WITH,
  CHATGPT_URL,
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

const ChatGPT = observer(function EditorPanel() {
  const styles = useStyles();
  const url = stores.settingStore.settings[CHATGPT_URL] as string;
  const cls = stores.settingStore.settings[
    CHATGPT_MESSAGE_CLASS_STARTS_WITH
  ] as string;

  return (
    <div>
      <InputField
        className={styles.input}
        type="text"
        label="Font Family"
        defaultValue={url}
        onChange={(e) =>
          stores.settingStore.update(CHATGPT_URL, e.target.value)
        }
      />
      <InputField
        className={styles.input}
        type="text"
        label="Font Family"
        defaultValue={cls}
        onChange={(e) =>
          stores.settingStore.update(
            CHATGPT_MESSAGE_CLASS_STARTS_WITH,
            e.target.value,
          )
        }
      />
    </div>
  );
});

export default ChatGPT;
