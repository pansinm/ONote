import * as path from 'path';
import * as fs from 'fs/promises';
import * as YAML from 'yaml';
import * as MimeTypes from 'mime-types';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import type {
  IBackend,
  Note,
  Notepad,
  RequireKey,
  Resource,
  TODO,
} from './types';
import type { Diagram } from '../diagramrenderer/types';
import createRenderer from '../diagramrenderer/createRenderer';

class LocalBackend implements IBackend {
  projectId: string;
  constructor(projectId: string) {
    this.projectId = projectId;
  }

  private async readNotepadRecords(): Promise<Record<string, Notepad>> {
    const content = await fs.readFile(
      path.resolve(this.projectId, 'notepads.yaml'),
      'utf-8',
    );
    return YAML.parse(content);
  }

  private async saveNotepadRecords(notepadRecords: Record<string, Notepad>) {
    const yaml = YAML.stringify(notepadRecords);
    await fs.writeFile(
      path.resolve(this.projectId, 'notepads.yaml'),
      yaml,
      'utf-8',
    );
  }

  private async readNoteRecords(): Promise<Record<string, Note>> {
    const content = await fs.readFile(
      path.resolve(this.projectId, 'notes.yaml'),
      'utf-8',
    );
    return YAML.parse(content);
  }

  private async saveNoteRecords(records: Record<string, Note>) {
    const yaml = YAML.stringify(records);
    await fs.writeFile(
      path.resolve(this.projectId, 'notes.yaml'),
      yaml,
      'utf-8',
    );
  }

  private async readTodoRecords(): Promise<Record<string, TODO>> {
    const content = await fs.readFile(
      path.resolve(this.projectId, 'todos.yaml'),
      'utf-8',
    );
    return YAML.parse(content);
  }

  private async saveTodoRecords(records: Record<string, TODO>) {
    const yaml = YAML.stringify(records);
    await fs.writeFile(
      path.resolve(this.projectId, 'todos.yaml'),
      yaml,
      'utf-8',
    );
  }

  /**
   * 拉取笔记本
   * @returns
   */
  async fetchNotepads() {
    try {
      const records = await this.readNotepadRecords();
      return Object.values(records);
    } catch (err) {
      return [];
    }
  }

  async createNotepad(
    notepad: RequireKey<Partial<Notepad>, 'name'>,
  ): Promise<Notepad> {
    const id = uuid();
    const np: Notepad = {
      id,
      ...notepad,
      count: 0,
    };
    const notepads = await this.readNotepadRecords();
    notepads[id] = np;
    await this.saveNotepadRecords(notepads);
    return np;
  }

  async updateNotepad(
    notepadId: string,
    notepad: Partial<Notepad>,
  ): Promise<Notepad> {
    const records = await this.readNotepadRecords();
    const record = Object.assign({}, records[notepadId], notepad, {
      id: notepadId,
    });
    if (!record) {
      throw new Error('笔记本不存在');
    }
    records[notepadId] = record;
    await this.saveNotepadRecords(records);
    return record;
  }

  async deleteNotepad(notepadId: string): Promise<void> {
    const records = await this.readNotepadRecords();
    delete records[notepadId];
    await this.saveNotepadRecords(records);
  }

  async fetchNotesByNotepadId(notepadId: string): Promise<Note[]> {
    const records = await this.readNoteRecords();
    return Object.values(records).filter((note) => note.id === notepadId);
  }

  async createNote(
    note: RequireKey<Partial<Note>, 'notepad' | 'title'>,
  ): Promise<Note> {
    const noteId = uuid();
    const createdNote: Note = {
      ...note,
      id: noteId,
      uri: `onote://notes/${noteId}/readme.md`,
    };
    const records = await this.readNoteRecords();
    records[noteId] = createdNote;
    await this.saveNoteRecords(records);
    return createdNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const records = await this.readNoteRecords();
    delete records[noteId];
    await this.saveNoteRecords(records);
  }

  async updateNote(noteId: string, note: Partial<Note>): Promise<Note> {
    const records = await this.readNoteRecords();
    const record = records[noteId];
    if (!record) {
      throw new Error('笔记不存在');
    }
    records[noteId] = {
      ...record,
      ...note,
      id: noteId,
    };
    await this.saveNoteRecords(records);
    return records[noteId];
  }

  private uriToFsPath(uri: string) {
    const url = new URL(uri);
    let filePath = '';
    if (url.protocol === 'file') {
      filePath = fileURLToPath(uri);
    }
    if (url.protocol === 'onote') {
      filePath = path.resolve(
        path.join(this.projectId, url.host, url.pathname),
      );
    }
    if (!filePath) {
      throw new Error('不能识别该uri');
    }
    return filePath;
  }
  async readResource(uri: string): Promise<Resource> {
    const filePath = this.uriToFsPath(uri);
    const mime = MimeTypes.lookup(filePath);
    if (!filePath || !mime) {
      throw new Error('不能识别该uri');
    }
    if (/text|json/.test(mime)) {
      return {
        uri,
        mime,
        content: await fs.readFile(filePath, 'utf-8'),
        version: (await fs.stat(filePath)).ctimeMs,
      };
    }
    return {
      uri,
      mime,
      content: (await fs.readFile(filePath)).toString('base64'),
      version: (await fs.stat(filePath)).ctimeMs,
    };
  }

  async saveResource(
    uri: string,
    content: string,
    curVersion: number,
  ): Promise<{ version: number }> {
    const filePath = await this.uriToFsPath(uri);
    const version = (await fs.stat(filePath)).ctimeMs;
    if (version > curVersion) {
      throw new Error('当前版本比较新，不能保存');
    }
    const mime = MimeTypes.lookup(filePath);
    if (!mime) {
      throw new Error('当前不支持该文件类型');
    }
    if (/text|json/.test(mime)) {
      await fs.writeFile(filePath, content, 'utf-8');
    }
    await fs.writeFile(filePath, Buffer.from(content, 'base64'));
    return {
      version: (await fs.stat(filePath)).ctimeMs,
    };
  }

  async fetchTodos(): Promise<TODO[]> {
    const records = await this.readTodoRecords();
    return Object.values(records);
  }
  async createTodo(todo: RequireKey<Partial<TODO>, 'title'>): Promise<TODO> {
    const records = await this.readTodoRecords();
    const id = uuid();
    records[id] = {
      createdAt: Date.toString(),
      status: 'doing',
      ...todo,
      id,
    };
    await this.saveTodoRecords(records);
    return records[id];
  }

  async deleteTodo(id: string): Promise<void> {
    const records = await this.readTodoRecords();
    delete records[id];
    await this.saveTodoRecords(records);
  }

  renderDiagram(
    type: string,
    code: string,
    options: Record<string, string>,
  ): Promise<Diagram> {
    const renderer = createRenderer(type, code, options);
    return renderer?.render();
  }
}

export default LocalBackend;
