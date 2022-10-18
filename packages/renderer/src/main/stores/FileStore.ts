import { makeAutoObservable } from 'mobx';
import fileService from '../services/fileService';
import * as monaco from 'monaco-editor';
import { stringify } from 'yaml';
import { isMarkdown } from '/@/utils/uri';

type FileState =
  | 'loading'
  | 'loaded'
  | 'changed'
  | 'saving'
  | 'saved'
  | 'error';

class FileStateStore {
  states: { [uri: string]: FileState } = {};

  timeouts: { [uri: string]: any } = {};

  constructor() {
    makeAutoObservable(this);
  }

  private getModel(uri: string) {
    const aUri = monaco.Uri.parse(uri);
    const model = monaco.editor.getModel(aUri);
    return model;
  }

  private async createModel(uri: string, value: string) {
    const aUri = monaco.Uri.parse(uri);
    const lang = isMarkdown(uri) ? 'markdown' : undefined;
    const model = monaco.editor.createModel(value, lang, aUri);
    // 关闭时，保存文件
    model.onWillDispose(() => {
      if (this.states[uri] === 'changed') {
        this.saveFile(uri, model.getValue());
      }
    });
    return model;
  }

  async getOrCreateModel(uri: string) {
    const model = this.getModel(uri);
    if (model) {
      return model;
    }
    const text = await this.readFile(uri);
    // 防止并发
    return this.getModel(uri) || this.createModel(uri, text);
  }

  markFileState(uri: string, state: FileState) {
    const nextStates = {
      ...this.states,
      [uri]: state,
    };
    this.states = nextStates;
  }

  closeFile(uri: string) {
    return this.getModel(uri)?.dispose();
  }

  get savedFiles() {
    return Object.keys(this.states).filter((file) => {
      this.states[file] !== 'changed';
    });
  }

  private async readFile(uri: string) {
    try {
      this.markFileState(uri, 'loading');
      const content = await fileService.readText(uri);
      this.markFileState(uri, 'loaded');
      return content;
    } catch (err) {
      this.markFileState(uri, 'error');
      throw err;
    }
  }

  async save(uri: string) {
    const model = this.getModel(uri);
    if (model) {
      return this.saveFile(uri, model.getValue());
    }
  }

  async saveLater(uri: string) {
    const model = this.getModel(uri);
    if (model) {
      return this.saveFileLater(uri, model.getValue());
    }
  }

  async saveFile(uri: string, content: string) {
    if (this.states[uri] !== 'changed') {
      this.markFileState(uri, 'saved');
      return;
    }
    try {
      this.markFileState(uri, 'loading');
      await fileService.writeText(uri, content);
      this.markFileState(uri, 'saved');
    } catch (err) {
      this.markFileState(uri, 'error');
      throw err;
    }
  }

  async saveFileLater(uri: string, content: string, timeMs = 5000) {
    clearTimeout(this.timeouts[uri]);
    this.timeouts[uri] = setTimeout(() => {
      this.saveFile(uri, content);
    }, timeMs);
  }
}

export default FileStateStore;
