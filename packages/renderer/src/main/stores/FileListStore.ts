import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';
import fileService from '../services/fileService';
import type ActivationStore from './ActivationStore';

class FileListStore {
  files: TreeNode[] = [];

  activationStore: ActivationStore;

  constructor(activationStore: ActivationStore) {
    this.activationStore = activationStore;
    makeAutoObservable(this);

    reaction(
      () => this.activationStore.activeDirUri,
      () => {
        this.refreshFiles();
      },
    );
  }

  refreshFiles() {
    const dirUri = this.activationStore.activeDirUri;
    if (dirUri) {
      fileService.readdir(dirUri).then((nodes) => {
        if (dirUri === this.activationStore.activeDirUri) {
          runInAction(() => {
            this.files = nodes.filter((node) => node.type === 'file');
          });
        }
      });
    } else {
      this.files = [];
    }
  }
}

export default FileListStore;
