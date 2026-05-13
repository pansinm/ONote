import {
  Checkbox as CheckboxField,
  Field,
  Input,
} from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PLANTUML_ENDPOINT,
  PLANTUML_USECACHE,
} from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';

function PlantUMLPanel() {
  const { t } = useTranslation('setting');
  const server = stores.settingStore.settings[PLANTUML_ENDPOINT] as string;
  const useCache =
    (stores.settingStore.settings[PLANTUML_USECACHE] as boolean) || false;

  const [localServer, setLocalServer] = useState(server || '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalServer(server || '');
  }, [server]);

  const handleServerChange = (value: string) => {
    setLocalServer(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stores.settingStore.update(PLANTUML_ENDPOINT, value);
    }, 400);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <Field label={t('plantumlServer')} style={{ marginBottom: '16px' }}>
        <Input
          value={localServer}
          onChange={(_e, data) => handleServerChange(data.value)}
        />
      </Field>
      <CheckboxField
        label={t('useLocalCache')}
        checked={useCache}
        onChange={(e, data) =>
          stores.settingStore.update(PLANTUML_USECACHE, data.checked)
        }
      />
    </div>
  );
}

export default observer(PlantUMLPanel);
