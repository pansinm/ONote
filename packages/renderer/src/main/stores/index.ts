import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';
import FileStateStore from './FileStore';
import LayoutStore from './LayoutStore';

const fileStore = new FileStateStore();
const activationStore = new ActivationStore(fileStore);
export default {
  activationStore,
  fileStore,
  layoutStore: new LayoutStore(),
  fileListStore: new FileListStore(activationStore),
};
