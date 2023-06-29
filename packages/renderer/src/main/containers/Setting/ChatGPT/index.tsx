import { Checkbox, makeStyles } from '@fluentui/react-components';
import { Field } from '@fluentui/react-components';
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
      <Field
        className={styles.input}
        type="text"
        label="ChatGPT URL"
        placeholder="右侧侧边栏会打开该页面"
        defaultValue={url}
        onChange={(e) =>
          stores.settingStore.update(CHATGPT_URL, e.target.value)
        }
      />
      <Field
        className={styles.input}
        type="text"
        label="消息 Class"
        placeholder="用于定位插入按钮，一键回填到编辑器"
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
