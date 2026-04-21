import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';
import fileService from '../services/fileService';
import type ActivationStore from './ActivationStore';
import { isEquals } from '/@/common/utils/uri';
import _ from 'lodash';
import { getLogger } from '/@/shared/logger';
import { FILE_CREATED, FILE_DELETED, FILE_RENAMED, FILE_MOVED } from '../eventbus/EventName';
import eventbus from '../eventbus/eventbus';

const logger = getLogger('FileListStore');

class FileListStore {
  _files: TreeNode[] = [];

  activationStore: ActivationStore;

  sorter: 'name-asc' | 'name-desc' | 'time-asc' | 'time-desc' = 'name-asc';

  /** 防抖定时器 */
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

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

    // 事件驱动的刷新，带 100ms 防抖
    const debouncedRefresh = () => {
      if (this._refreshTimer) clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        this._refreshTimer = null;
        this.refreshFiles();
      }, 100);
    };

    eventbus.on(FILE_CREATED, debouncedRefresh);
    eventbus.on(FILE_DELETED, debouncedRefresh);
    eventbus.on(FILE_RENAMED, debouncedRefresh);
    eventbus.on(FILE_MOVED, debouncedRefresh);
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
