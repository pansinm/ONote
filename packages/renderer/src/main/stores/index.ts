import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';
import FileStateStore from './FileStore';
import LayoutStore from './LayoutStore';
import SettingStore from './SettingStore';
import TodoStore from './TodoStore';

const fileStore = new FileStateStore();
const activationStore = new ActivationStore(fileStore);
export default {
  activationStore,
  fileStore,
  settingStore: new SettingStore(),
  layoutStore: new LayoutStore(),
  todoStore: new TodoStore(activationStore),
  fileListStore: new FileListStore(activationStore),
};
