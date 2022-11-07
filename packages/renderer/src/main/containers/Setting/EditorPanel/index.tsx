import { Checkbox } from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { EDITOR_MODE } from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';

const EditorPanel = observer(function EditorPanel() {
  const mode = stores.settingStore.settings[EDITOR_MODE];
  const toggleVIMMode = () => {
    stores.settingStore.update(
      EDITOR_MODE,
      mode === 'VIM_MODE' ? 'NORMAL_MODE' : 'VIM_MODE',
    );
  };
  return (
    <div>
      <Checkbox
        label={'VIM 模式'}
        checked={mode === 'VIM_MODE'}
        onChange={toggleVIMMode}
      />
    </div>
  );
});

export default EditorPanel;
