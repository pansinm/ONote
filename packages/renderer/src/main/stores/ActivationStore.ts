import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { fsPath2Uri, uri2fsPath } from '../../utils/uri';
import type { AvailableNote } from './NoteStore';
import type NoteStore from './NoteStore';
import YAML from 'yaml';
import _ from 'lodash';

export type NoteResource = AvailableNote & {
  category: 'note';
  uri: string;
  changed: boolean;
};

export type AssetResource = {
  category: 'asset';
  uri: string;
  changed: boolean;
};

export type AvailableResource = NoteResource | AssetResource;

class ResourceStore {
  openedResources: AvailableResource[] = [];

  openedFiles: string[] = [];

  activeDirUri = '';

  activeFileUri = '';

  hideSidebar = false;

  /**
   * 是否正在编辑中
   */
  editedState: { [uri: string]: boolean } = {};

  noteStore: NoteStore;

  activeNotepad = '';
  activeTag = '';
  activeNote = '';

  private rootDir = '';

  constructor(noteStore: NoteStore) {
    this.noteStore = noteStore;
    makeAutoObservable(this);
  }

  get activatedResource() {
    return this.openedResources.find(
      (resource) => resource.uri === this.activeFileUri,
    );
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

  async load(rootDir: string) {
    this.rootDir = rootDir;
    const stateFile = [rootDir, 'state.yml'].join('/');
    const text = await window.simmer.readFile(stateFile, 'utf-8');
    const {
      activeNotepad = '',
      activeNote = '',
      activeTag = '',
      activeResourceUri = '',
      openedResources = [],
    } = YAML.parse(text);
    this.activeNote = activeNote;
    this.activeNotepad = activeNotepad;
    this.activeTag = activeTag;
    this.activeFileUri = activeResourceUri;
    this.openedResources = openedResources;
  }

  async saveYaml() {
    const stateFile = [this.rootDir, 'state.yml'].join('/');
    const yaml = YAML.stringify({
      activeNotepad: this.activeNotepad,
      activeNote: this.activeNote,
      activeTag: this.activeTag,
      activeResourceUri: this.activeFileUri,
      openedResources: this.openedResources,
    });
    await window.simmer.writeFile(stateFile, yaml, 'utf-8');
  }

  openResource(resource: AvailableResource) {
    const uri = resource.uri;
    if (!this.openedResources.find((resource) => resource.uri === uri)) {
      this.openedResources = [...this.openedResources, resource];
    }
    this.activeFileUri = uri;
  }

  /**
   * 打开资源文件
   * @param uri
   */
  openNote(note: AvailableNote, fsPath: string) {
    this.openResource({
      ...note,
      uri: fsPath2Uri(fsPath),
      category: 'note',
      changed: false,
    });
  }

  async openAsset(filePath: string) {
    this.openResource({
      uri: fsPath2Uri(filePath),
      category: 'asset',
      changed: false,
    });
  }

  markResourceUnsaved(uri: string, changed: boolean) {
    const resource = this.openedResources.find(
      (resource) => resource.uri === uri,
    );
    if (resource) {
      resource.changed = changed;
    }
  }

  /**
   * 关闭资源文件
   * @param uri
   */
  closeResource(uri: string) {
    const index = this.openedResources.findIndex(
      (resource) => resource.uri === uri,
    );
    if (index > -1) {
      this.openedResources = this.openedResources.filter(
        (resource) => resource.uri !== uri,
      );
      if (uri === this.activeFileUri) {
        this.activeFileUri =
          (this.openedResources[index - 1] || this.openedResources[index])
            ?.uri || '';
      }
    }
  }

  saveResource(uri: string, content: string) {
    if (/^inmemory/.test(uri)) {
      return;
    }
    const path = uri2fsPath(uri);
    window.simmer.writeFile(path, content);
    this.markResourceUnsaved(uri, false);
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
    await window.simmer.writeFile(uri2fsPath(uri), content);
    runInAction(() => {
      this.editedState[uri] = false;
      delete this.editedState[uri];
    });
  }

  /**
   * 将文件设置为编辑状态
   * @param uri
   */
  setEditedState(uri: string) {
    this.editedState[uri] = true;
  }

  /**
   * 关闭右侧文件
   * @param uri
   */
  closeRightResources(uri: string) {
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
  closeAllResources() {
    this.activeFileUri = '';
    this.openedFiles = [];
  }

  /** 关闭已保存标签 */
  closeSavedResources() {
    const savedResources = this.openedResources.filter(
      (resource) => !resource.changed,
    );
    this.openedResources = savedResources;
    if (
      !savedResources.find((resource) => resource.uri === this.activeFileUri)
    ) {
      this.activeFileUri = savedResources[savedResources.length - 1]?.uri || '';
    }
  }
}

export default ResourceStore;
