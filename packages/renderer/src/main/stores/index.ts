import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';
import FileStateStore from './FileStore';

const fileStore = new FileStateStore();
const activationStore = new ActivationStore(fileStore);
export default {
  activationStore,
  fileStore,
  fileListStore: new FileListStore(activationStore),
};
