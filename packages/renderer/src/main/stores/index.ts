import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';
import FileStateStore from './FileStore';
import LayoutStore from './LayoutStore';
import SettingStore from './SettingStore';

const fileStore = new FileStateStore();
const activationStore = new ActivationStore(fileStore);
export default {
  activationStore,
  fileStore,
  settingStore: new SettingStore(),
  layoutStore: new LayoutStore(),
  fileListStore: new FileListStore(activationStore),
};
