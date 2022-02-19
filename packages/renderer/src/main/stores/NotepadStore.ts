import { v4 as uuid } from 'uuid';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import YAML from 'yaml';
import type ConfigStore from './ConfigStore';
import _ from 'lodash';

interface Notepad {
  id: string;
  /** 笔记本名称 */
  name: string;
  /** 笔记数量 */
  count: number;
}

class NotepadStore {
  configStore: ConfigStore;

  constructor(projectStore: ConfigStore) {
    this.configStore = projectStore;
    makeAutoObservable(this);

    // 切换目录后，重新加载笔记本配置
    reaction(
      () => this.configStore.config.root,
      () => {
        this.loadNotepads();
      },
      {
        fireImmediately: true,
      },
    );

    // 笔记本数据变化后，持久化
    reaction(
      () => this.notepads,
      () => {
        this.saveNotepads();
      },
      {
        delay: 1000,
      },
    );
  }

  notepads: Notepad[] = [];

  get notesCount() {
    return _.sum(this.notepads.map((notepad) => notepad.count));
  }

  private async loadNotepads() {
    if (!this.configStore.config.root) {
      return;
    }
    let notepads: Notepad[] = [];
    try {
      const notepadConfig = [this.configStore.config.root, 'notepads.yml'].join(
        '/',
      );
      const content = await window.simmer.readFile(notepadConfig, 'utf8');
      notepads = YAML.parse(content);
    } catch (err) {
      console.error(err);
    }
    runInAction(() => {
      this.notepads = notepads;
    });
  }

  /**
   * 创建笔记本
   * @param notepad
   * @returns
   */
  createNotepad(notepad: Omit<Notepad, 'id'>) {
    const id = uuid();
    this.notepads = [
      {
        ...notepad,
        id,
      },
      ...this.notepads,
    ];
  }

  get(id: string) {
    return this.notepads.find((notepad) => notepad.id === id);
  }
  /**
   * 删除笔记本
   * @param id
   * @returns
   */
  delete(id: string) {
    const index = this.notepads.findIndex((notepad) => notepad.id === id);
    if (index < 0) {
      return;
    }

    // 删除笔记本
    this.notepads = this.notepads.filter((notepad) => notepad.id !== id);
  }

  /**
   * 重命名笔记本
   * @param id
   * @param name
   */
  update(id: string, newNotepad: Partial<Omit<Notepad, 'id'>>) {
    this.notepads = this.notepads.map((notepad) => {
      if (notepad.id === id) {
        return {
          ...notepad,
          ...newNotepad,
        };
      }
      return notepad;
    });
  }

  private async saveNotepads() {
    if (!this.configStore.config.root) {
      return;
    }
    const notepadsFile = [this.configStore.config.root, 'notepads.yml'].join(
      '/',
    );
    await window.simmer.writeFile(notepadsFile, YAML.stringify(this.notepads));
  }
}

export default NotepadStore;
