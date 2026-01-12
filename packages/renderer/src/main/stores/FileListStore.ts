import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';
import fileService from '../services/fileService';
import type ActivationStore from './ActivationStore';
import { isEquals } from '/@/common/utils/uri';
import _ from 'lodash';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('FileListStore');

class FileListStore {
  _files: TreeNode[] = [];

  activationStore: ActivationStore;

  sorter: 'name-asc' | 'name-desc' | 'time-asc' | 'time-desc' = 'name-asc';

  get files(): TreeNode[] {
    switch (this.sorter) {
      case 'name-asc':
        return _.orderBy(this._files, 'name', 'asc');
      case 'name-desc':
        return _.orderBy(this._files, 'name', 'desc');
      case 'time-asc':
        return _.orderBy(this._files, 'mtime', 'asc');
      case 'time-desc':
        return _.orderBy(this._files, 'mtime', 'desc');
      default:
        logger.warn('Unknown sorter', { sorter: this.sorter, fileCount: this._files.length });
        return this._files;
    }
  }
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

  setSorter(sorter: typeof this.sorter) {
    this.sorter = sorter;
  }

  refreshFiles() {
    const dirUri = this.activationStore.activeDirUri;
    if (dirUri) {
      fileService.listDir(dirUri).then((nodes) => {
        if (isEquals(dirUri, this.activationStore.activeDirUri)) {
          runInAction(() => {
            this._files = nodes.filter((node) => node.type === 'file');
          });
        }
      });
    } else {
      this._files = [];
    }
  }
}

export default FileListStore;
