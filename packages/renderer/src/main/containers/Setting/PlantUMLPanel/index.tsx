import {
  Checkbox as CheckboxField,
  Field,
  Input,
} from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React from 'react';
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

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <Field label={t('plantumlServer')} style={{ marginBottom: '16px' }}>
        <Input
          value={server || ''}
          onChange={(e, data) =>
            stores.settingStore.update(PLANTUML_ENDPOINT, data.value)
          }
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
