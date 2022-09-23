import ActivationStore from './ActivationStore';
import FileListStore from './FileListStore';

const activationStore = new ActivationStore();
  export default {
    activationStore,
    fileListStore: new FileListStore(activationStore),
  };
