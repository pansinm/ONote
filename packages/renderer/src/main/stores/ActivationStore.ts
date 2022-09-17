import { makeAutoObservable, runInAction } from 'mobx';
import _ from 'lodash';

class ActivationStore {
  openedFiles: string[] = [];

  rootUri = '';
  activeDirUri = '';

  activeFileUri = '';

  hideSidebar = false;

  /**
   * 是否正在编辑中
   */
  editState: { [uri: string]: 'editing' | 'saved' } = {};

  constructor() {
    makeAutoObservable(this);
  }

  setRootUri(uri: string) {
    this.openedFiles = [];
    this.activeDirUri = '';
    this.rootUri = uri;
  }

  activeDir(uri: string) {
    this.activeDirUri = uri;
  }

  openFile(uri: string) {
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

  toggleSidebar() {
    this.hideSidebar = !this.hideSidebar;
  }

  reorderOpenedFiles(fromIndex: number, toIndex: number) {
    const openedUris = [...this.openedFiles];
    const [fromUri] = openedUris.splice(fromIndex, 1);
    openedUris.splice(toIndex, 0, fromUri);
    this.openedFiles = openedUris;
  }

  /**
   * 保存文件
   * @param uri
   * @param content
   */
  async save(uri: string, content: string) {
    await window.fileService.writeText(uri, content);
    runInAction(() => {
      this.editState[uri] = 'saved';
      delete this.editState[uri];
    });
  }

  /**
   * 将文件设置为编辑状态
   * @param uri
   */
  setEditState(uri: string, state: 'editing' | 'saved') {
    this.editState = {
      ...this.editState,
      [uri]: state,
    };
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
    // TODO
  }
}

export default ActivationStore;
