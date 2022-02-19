import YAML from 'yaml';
import { v4 as uuid } from 'uuid';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import _ from 'lodash';
import type ConfigStore from './ConfigStore';
import { fsPath2Uri } from '../../utils/uri';

export interface Note {
  id: string;
  type: 'diagram' | 'markdown' | 'todo';
  title: string;
  labels?: string[];
  /**
   *  所属笔记本
   */
  notepad: string;
}

export interface DiagramNote extends Note {
  type: 'diagram';
  diagram: 'graphviz' | 'drawio' | 'plantuml';
}

export interface MarkdownNote extends Note {
  type: 'markdown';
}

export interface TodoNote extends Note {
  type: 'todo';
  done: boolean;
}

export type AvailableNote = MarkdownNote | TodoNote | DiagramNote;

type Notes = {
  [id: string]: AvailableNote;
};

class NoteStore {
  notes: Notes = {};

  configStore: ConfigStore;

  get allNotes() {
    return Object.values(this.notes);
  }

  get groupByNotepad(): { [id: string]: AvailableNote[] } {
    console.log(this.notes);
    return _.groupBy(this.allNotes, 'notepad');
  }

  get groupByLabel(): { [id: string]: AvailableNote[] } {
    return this.allNotes.reduce((notes, cur) => {
      if (cur.labels?.length) {
        cur.labels.forEach((label) => {
          if (!notes[label]) {
            notes[label] = [];
          }
          notes[label].push(cur as AvailableNote);
        });
      }
      return notes;
    }, {} as { [id: string]: AvailableNote[] });
  }

  /**
   * 笔记本的数量
   * @returns
   */
  get countsByNotepad() {
    return Object.keys(this.groupByNotepad).reduce((counts, key) => {
      counts[key] = this.groupByNotepad[key]?.length || 0;
      return counts;
    }, {} as { [notepadId: string]: number });
  }

  constructor(configStore: ConfigStore) {
    this.configStore = configStore;
    makeAutoObservable(this);
    // 切换目录后，重新加载笔记本配置
    reaction(
      () => this.configStore.config.root,
      () => {
        this.loadNotes();
      },
      {
        fireImmediately: true,
      },
    );

    // 笔记本数据变化后，持久化
    reaction(
      () => this.notes,
      () => {
        this.saveNotes();
      },
      {
        delay: 1000,
      },
    );
  }

  updateNote(id: string, note: Partial<Omit<AvailableNote, 'id'>>) {
    if (this.notes[id]) {
      this.notes = {
        ...this.notes,
        [id]: {
          ...this.notes[id],
          ...note,
        } as AvailableNote,
      };
    }
  }

  setTitle(id: string, title: string): void {
    this.updateNote(id, { title });
  }

  private async loadNotes() {
    if (!this.configStore.config.root) {
      return;
    }
    let notes: Notes = {};
    try {
      const notepadConfig = [this.configStore.config.root, 'notes.yml'].join(
        '/',
      );
      const content = await window.simmer.readFile(notepadConfig, 'utf8');
      notes = YAML.parse(content);
    } catch (err) {
      console.error(err);
    }
    runInAction(() => {
      this.notes = notes;
    });
  }

  createNote(note: Omit<AvailableNote, 'id'>) {
    const id = uuid();
    const noteWithId: AvailableNote = { ...note, id } as any;
    this.notes = { ...this.notes, [id]: noteWithId };
  }

  deleteNote(noteId: string) {
    const newNotes = { ...this.notes };
    delete newNotes[noteId];
    this.notes = newNotes;
  }

  private async saveNotes() {
    if (!this.configStore.config.root) {
      return;
    }
    const notepadsFile = [this.configStore.config.root, 'notes.yml'].join('/');
    await window.simmer.writeFile(notepadsFile, YAML.stringify(this.notes));
  }

  getNotePath(note: AvailableNote) {
    if (!this.configStore.config.root) {
      throw new Error('未初始化');
    }
    let ext = 'md';
    if (note.type === 'diagram') {
      ext = [note.type, note.diagram, '.svg'].join('.');
    } else if (note.type === 'todo') {
      ext = 'todo.md';
    }
    return [
      this.configStore.config.root,
      'notes',
      note.id,
      'readme.' + ext,
    ].join('/');
  }

  getNoteUrl(note: AvailableNote) {
    return fsPath2Uri(this.getNotePath(note));
  }
}

export default NoteStore;
