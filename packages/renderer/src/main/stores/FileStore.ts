import { makeAutoObservable, runInAction } from 'mobx';
import fileService from '../services/fileService';

// loading -> loaded -> changed -> saving -> saved --> closed

type FileState =
  | 'loading'
  | 'loaded'
  | 'changed'
  | 'saving'
  | 'saved'
  | 'error';

class FileStateStore {
  states: { [uri: string]: FileState } = {};

  constructor() {
    makeAutoObservable(this);
  }

  markFileState(uri: string, state: FileState) {
    const nextStates = {
      ...this.states,
      [uri]: state,
    };
    this.states = nextStates;
  }

  get savedFiles() {
    return Object.keys(this.states).filter((file) => {
      this.states[file] !== 'changed';
    });
  }

  async readFile(uri: string) {
    try {
      this.markFileState(uri, 'saving');
      const content = await fileService.readText(uri);
      this.markFileState(uri, 'saved');
      return content;
    } catch (err) {
      this.markFileState(uri, 'error');
      throw err;
    }
  }

  timeouts: { [uri: string]: any } = {};
  async saveFileLater(uri: string, content: string, timeMs = 5000) {
    clearTimeout(this.timeouts[uri]);
    this.timeouts[uri] = setTimeout(() => {
      this.saveFile(uri, content);
    }, timeMs);
  }

  async saveFile(uri: string, content: string) {
    try {
      this.markFileState(uri, 'loading');
      await fileService.writeText(uri, content);
      this.markFileState(uri, 'loaded');
    } catch (err) {
      this.markFileState(uri, 'error');
      throw err;
    }
  }
}

export default FileStateStore;
