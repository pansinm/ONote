import { makeAutoObservable, reaction } from 'mobx';
import _ from 'lodash';
import type FileStateStore from './FileStore';
import { isEquals } from '/@/common/utils/uri';
import type SettingStore from './SettingStore';
import { MAX_OPEN_TABS } from '/@/common/constants/SettingKey';

class ActivationStore {
  openedFiles: string[] = [];

  rootUri = '';

  activatedPage: 'notebook' = 'notebook';

  dataSourceId = 'local';

  activeDirUri = '';

  activeFileUri = '';

  hideSidebar = false;

  fileStore: FileStateStore;

  settingStore: SettingStore;

  fileActivationTimes: Map<string, number> = new Map();

  activatePage(page: 'notebook') {
    this.activatedPage = page;
  }

  constructor(fileStore: FileStateStore, settingStore: SettingStore) {
    this.fileStore = fileStore;
    this.settingStore = settingStore;
    makeAutoObservable(this);
    reaction(
      () => this.openedFiles,
      (files, prevFiles) => {
        const closedFiles = prevFiles.filter((file) => !files.includes(file));
        closedFiles.forEach((closedFile) => fileStore.closeFile(closedFile));
      },
    );
  }

  openNoteBook(dataSourceId: string, rootUri: string) {
    this.openedFiles = [];
    this.activeDirUri = '';
    this.rootUri = rootUri;
    this.dataSourceId = dataSourceId;
  }

  activeDir(uri: string) {
    this.activeDirUri = uri;
    this.activatePage('notebook');
  }

  activeFile(uri: string) {
    if (uri) {
      this.openedFiles = _.uniq([...this.openedFiles, uri]);
      this.fileActivationTimes.set(uri, Date.now());

      const maxTabs = parseInt(String(this.settingStore.settings[MAX_OPEN_TABS] || '10'), 10);
      const limit = maxTabs > 0 ? maxTabs : 10;

      if (this.openedFiles.length > limit) {
        let oldestUri = '';
        let oldestTime = Infinity;

        for (const fileUri of this.openedFiles) {
          if (fileUri !== uri) {
            const time = this.fileActivationTimes.get(fileUri) || 0;
            if (time < oldestTime) {
              oldestTime = time;
              oldestUri = fileUri;
            }
          }
        }

        if (oldestUri) {
          this.openedFiles = this.openedFiles.filter((f) => f !== oldestUri);
          this.fileActivationTimes.delete(oldestUri);
        }
      }
    }
    this.activeFileUri = uri;
    this.activatePage('notebook');
  }

  closeFile(uri: string) {
    const index = this.openedFiles.findIndex((fileUri) =>
      isEquals(fileUri, uri),
    );
    if (index > -1) {
      this.openedFiles = this.openedFiles.filter((fileUri) => fileUri !== uri);
      this.fileActivationTimes.delete(uri);
      if (isEquals(uri, this.activeFileUri)) {
        this.activeFile(
          this.openedFiles[index - 1] || this.openedFiles[index] || '',
        );
      }
    }
  }

  closeFilesInDir(dirUri: string) {
    this.openedFiles = this.openedFiles.filter(
      (file) => !file.startsWith(dirUri + '/'),
    );
    if (isEquals(this.activeDirUri, dirUri)) {
      this.activeDirUri = '';
    }
    const activeFileUri =
      this.openedFiles.find((uri) => isEquals(uri, this.activeFileUri)) ||
      _.last(this.openedFiles) ||
      '';
    this.activeFile(activeFileUri);
  }

  toggleSidebar() {
    this.hideSidebar = !this.hideSidebar;
  }

  reorderOpenedFiles(fromIndex: number, toIndex: number) {
    const openedUris = [...this.openedFiles];
    const [fromUri] = openedUris.splice(fromIndex, 1);
    openedUris.splice(toIndex, 0, fromUri);
    this.openedFiles = openedUris;
  }

  renameFileUri(uri: string, newUri: string) {
    this.openedFiles = this.openedFiles.map((file) => {
      if (isEquals(uri, file)) {
        return newUri;
      }
      return file;
    });
    const activationTime = this.fileActivationTimes.get(uri);
    if (activationTime !== undefined) {
      this.fileActivationTimes.delete(uri);
      this.fileActivationTimes.set(newUri, activationTime);
    }
    if (isEquals(this.activeFileUri, newUri)) {
      this.activeFile(newUri);
    }
  }

  renameDirUri(dirUri: string, newDirUri: string) {
    this.openedFiles = this.openedFiles.map((file) =>
      file.startsWith(dirUri + '/') ? file.replace(dirUri, newDirUri) : file,
    );
    if (isEquals(this.activeDirUri, dirUri)) {
      this.activeDir(newDirUri);
    }
    if (this.activeFileUri.startsWith(dirUri + '/')) {
      this.activeDir(newDirUri);
    }
  }

  /**
   * 保存文件
   * @param uri
   * @param content
   */
  async save(uri: string, content: string) {
    return this.fileStore.saveFile(uri, content);
  }

  /**
   * 关闭右侧文件
   * @param uri
   */
  closeRightFiles(uri: string) {
    const index = this.openedFiles.findIndex((fileUri) =>
      isEquals(fileUri, uri),
    );
    if (index > -1) {
      this.openedFiles = this.openedFiles.slice(0, index + 1);
      if (
        this.openedFiles.find((fileUri) =>
          isEquals(fileUri, this.activeFileUri),
        )
      ) {
        this.activeFile(uri);
      } else {
        this.activeFile(this.openedFiles[this.openedFiles.length - 1] || '');
      }
    }
  }

  /**
   * 关闭左侧文件
   * @param uri
   */
  closeLeftFiles(uri: string) {
    const index = this.openedFiles.findIndex((fileUri) =>
      isEquals(fileUri, uri),
    );
    if (index > -1) {
      this.openedFiles = this.openedFiles.slice(index);
      if (
        this.openedFiles.find((resource) =>
          isEquals(resource, this.activeFileUri),
        )
      ) {
        this.activeFile(uri);
      } else {
        this.activeFile(this.openedFiles[this.openedFiles.length - 1] || '');
      }
    }
  }

  /**
   * 关闭其他文件
   * @param uri
   */
  closeOtherFiles(uri: string) {
    this.openedFiles = this.openedFiles.filter((fileUri) =>
      isEquals(fileUri, uri),
    );
    this.activeFile(uri);
  }

  /** 关闭所有 */
  closeAllFiles() {
    this.activeFile('');
    this.openedFiles = [];
    this.fileActivationTimes.clear();
  }

  /** 关闭已保存标签 */
  closeSavedFiles() {
    this.openedFiles = this.openedFiles.filter((file) =>
      this.fileStore.savedFiles.includes(file),
    );
    if (!this.openedFiles.includes(this.activeFileUri)) {
      this.activeFile(_.last(this.openedFiles) || '');
    }
  }
}

export default ActivationStore;
