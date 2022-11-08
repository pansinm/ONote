import { CheckboxField, InputField } from '@fluentui/react-components/unstable';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  PLANTUML_ENDPOINT,
  PLANTUML_USECACHE,
} from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';

function PlantUMLPanel() {
  const server = stores.settingStore.settings[PLANTUML_ENDPOINT] as string;
  const useCache =
    (stores.settingStore.settings[PLANTUML_USECACHE] as boolean) || false;

  return (
    <div>
      <InputField
        value={server || ''}
        label={'PlantUML Server'}
        onChange={(e, data) =>
          stores.settingStore.update(PLANTUML_ENDPOINT, data.value)
        }
      />
      <CheckboxField
        label={'使用本地缓存'}
        checked={useCache}
        onChange={(e, data) =>
          stores.settingStore.update(PLANTUML_USECACHE, data.checked)
        }
      />
    </div>
  );
}

export default observer(PlantUMLPanel);
