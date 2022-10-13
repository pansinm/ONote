import { makeAutoObservable, reaction, runInAction } from 'mobx';
import _ from 'lodash';
import type FileStateStore from './FileStore';

class ActivationStore {
  openedFiles: string[] = [];

  rootUri = '';
  activeDirUri = '';

  activeFileUri = '';

  hideSidebar = false;

  fileStore: FileStateStore;
  constructor(fileStore: FileStateStore) {
    this.fileStore = fileStore;
    makeAutoObservable(this);
    reaction(
      () => this.openedFiles,
      (files, prevFiles) => {
        const closedFiles = prevFiles.filter((file) => !files.includes(file));
        closedFiles.forEach((closedFile) => fileStore.closeFile(closedFile));
      },
    );
  }

  setRootUri(uri: string) {
    this.openedFiles = [];
    this.activeDirUri = '';
    this.rootUri = uri;
  }

  activeDir(uri: string) {
    this.activeDirUri = uri;
  }

  activeFile(uri: string) {
    this.openedFiles = _.uniq([...this.openedFiles, uri]);
    this.activeFileUri = uri;
  }

  closeFile(uri: string) {
    const index = this.openedFiles.findIndex((fileUri) => fileUri === uri);
    if (index > -1) {
      this.openedFiles = this.openedFiles.filter((fileUri) => fileUri !== uri);
      if (uri === this.activeFileUri) {
        this.activeFileUri =
          this.openedFiles[index - 1] || this.openedFiles[index] || '';
      }
    }
  }

  closeFilesInDir(dirUri: string) {
    this.openedFiles = this.openedFiles.filter(
      (file) => !file.startsWith(dirUri + '/'),
    );
    if (this.activeDirUri === dirUri) {
      this.activeDirUri = '';
    }
    this.activeFileUri =
      this.openedFiles.find((uri) => uri === this.activeFileUri) ||
      _.last(this.openedFiles) ||
      '';
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
      if (uri === file) {
        return newUri;
      }
      return file;
    });
    if (this.activeFileUri === newUri) {
      this.activeFileUri = newUri;
    }
  }

  renameDirUri(dirUri: string, newDirUri: string) {
    this.openedFiles = this.openedFiles.map((file) =>
      file.startsWith(dirUri + '/') ? file.replace(dirUri, newDirUri) : file,
    );
    if (this.activeDirUri === dirUri) {
      this.activeDirUri = newDirUri;
    }
    if (this.activeFileUri.startsWith(dirUri + '/')) {
      this.activeFileUri = newDirUri;
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
    const index = this.openedFiles.findIndex((fileUri) => fileUri === uri);
    if (index > -1) {
      this.openedFiles = this.openedFiles.slice(0, index + 1);
      if (this.openedFiles.find((fileUri) => fileUri === this.activeFileUri)) {
        this.activeFileUri = uri;
      } else {
        this.activeFileUri =
          this.openedFiles[this.openedFiles.length - 1] || '';
      }
    }
  }

  /**
   * 关闭左侧文件
   * @param uri
   */
  closeLeftFiles(uri: string) {
    const index = this.openedFiles.findIndex((fileUri) => fileUri === uri);
    if (index > -1) {
      this.openedFiles = this.openedFiles.slice(index);
      if (
        this.openedFiles.find((resource) => resource === this.activeFileUri)
      ) {
        this.activeFileUri = uri;
      } else {
        this.activeFileUri =
          this.openedFiles[this.openedFiles.length - 1] || '';
      }
    }
  }

  /**
   * 关闭其他文件
   * @param uri
   */
  closeOtherFiles(uri: string) {
    this.openedFiles = this.openedFiles.filter((fileUri) => fileUri === uri);
    this.activeFileUri = uri;
  }

  /** 关闭所有 */
  closeAllFiles() {
    this.activeFileUri = '';
    this.openedFiles = [];
  }

  /** 关闭已保存标签 */
  closeSavedFiles() {
    this.openedFiles = this.openedFiles.filter((file) =>
      this.fileStore.savedFiles.includes(file),
    );
    if (!this.openedFiles.includes(this.activeFileUri)) {
      this.activeFileUri = _.last(this.openedFiles) || '';
    }
  }
}

export default ActivationStore;
