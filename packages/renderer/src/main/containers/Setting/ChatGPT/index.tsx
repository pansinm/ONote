import { Checkbox, Input, makeStyles } from '@fluentui/react-components';
import { Field } from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CHATGPT_MESSAGE_CLASS_STARTS_WITH,
  LLM_BASE_URL,
  EDITOR_FONT_FAMILY,
  EDITOR_MODE,
  LLM_MODEL_NAME,
  LLM_API_KEY,
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
  const { t } = useTranslation('setting');
  const styles = useStyles();
  const baseUrl = stores.settingStore.settings[LLM_BASE_URL] as string;
  const modelName = stores.settingStore.settings[LLM_MODEL_NAME] as string;
  const apiKey = stores.settingStore.settings[LLM_API_KEY] as string;
  const cls = stores.settingStore.settings[
    CHATGPT_MESSAGE_CLASS_STARTS_WITH
  ] as string;

  return (
    <div>
      <Field className={styles.input} label={t('llmBaseUrl')}>
        <Input
          placeholder={t('llmBaseUrl')}
          defaultValue={baseUrl}
          onChange={(e) =>
            stores.settingStore.update(LLM_BASE_URL, e.target.value)
          }
        ></Input>
      </Field>
      <Field className={styles.input} label={t('modelName')}>
        <Input
          placeholder={t('modelName')}
          defaultValue={modelName}
          onChange={(e) =>
            stores.settingStore.update(LLM_MODEL_NAME, e.target.value)
          }
        />
      </Field>
      <Field className={styles.input} label={t('apiKey')}>
        <Input
          type="password"
          placeholder={t('apiKey')}
          defaultValue={apiKey}
          onChange={(e) =>
            stores.settingStore.update(LLM_API_KEY, e.target.value)
          }
        />
      </Field>
    </div>
  );
});

export default ChatGPT;
