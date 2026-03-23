import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';
import FileStateStore from './FileStore';
import I18nStore from './I18nStore';
import LayoutStore from './LayoutStore';
import SettingStore from './SettingStore';

const fileStore = new FileStateStore();
const settingStore = new SettingStore();
const activationStore = new ActivationStore(fileStore, settingStore);
export default {
  activationStore,
  fileStore,
  i18nStore: new I18nStore(),
  settingStore,
  layoutStore: new LayoutStore(),
  fileListStore: new FileListStore(activationStore),
};
