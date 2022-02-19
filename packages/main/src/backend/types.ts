import type { Diagram } from '../diagramrenderer/types';

export interface Notepad {
  id: string;
  /** 笔记本名称 */
  name: string;
  /** 笔记数量 */
  count: number;
}

export interface Note {
  id: string;
  /**
   * 笔记标题
   */
  title: string;
  /**
   * 对应标签
   */
  labels?: string[];
  /**
   *  所属笔记本
   */
  notepad: string;
  /**
   * 笔记对应路径
   */
  uri: string;
}

export interface TODO {
  id: string;
  title: string;
  status: 'doing' | 'done';
  createdAt: string;
  doneAt?: string;
  note?: {
    id: string;
  };
  plan?: {
    startAt: string;
    endAt: string;
  };
}

export interface Resource {
  uri: string;
  mime: string;
  content: string;
  version: number;
}

export type PartialWithoutId<T> = Partial<Exclude<T, 'id'>>;
export type RequireKey<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface IBackend {
  /**
   * 拉取笔记本列表
   */
  fetchNotepads(): Promise<Notepad[]>;

  /**
   * 创建笔记本
   */
  createNotepad(
    notepad: RequireKey<PartialWithoutId<Notepad>, 'name'>,
  ): Promise<Notepad>;

  /**
   * 更新笔记本
   * @param id
   * @param notepad
   */
  updateNotepad(
    notepadId: string,
    notepad: PartialWithoutId<Notepad>,
  ): Promise<Notepad>;

  /**
   * 删除笔记
   * @param notepadId
   */
  deleteNotepad(notepadId: string): Promise<void>;

  /**
   * 拉取笔记列表
   * @param notepadId
   */
  fetchNotesByNotepadId(notepadId: string): Promise<Note[]>;
  /**
   * 创建笔记
   * @param note
   */
  createNote(
    note: RequireKey<PartialWithoutId<Note>, 'notepad' | 'title'>,
  ): Promise<Note>;

  /**
   * 删除笔记
   * @param noteId
   */
  deleteNote(noteId: string): Promise<void>;

  /**
   * 更新笔记
   * @param noteId
   * @param note
   */
  updateNote(noteId: string, note: PartialWithoutId<Note>): Promise<Note>;

  /**
   * @param projectId
   * @param uri
   * 读取资源内容
   */
  readResource(uri: string): Promise<Resource>;

  /**
   * 保存资源
   * @param uri
   * @param content
   */
  saveResource(
    uri: string,
    content: string,
    curVersion: number,
  ): Promise<{ version: number }>;

  /**
   * 拉取任务清单
   */
  fetchTodos(): Promise<TODO[]>;

  /**
   * 创建任务
   */
  createTodo(todo: RequireKey<PartialWithoutId<TODO>, 'title'>): Promise<TODO>;

  /**
   * 删除笔记
   * @param id
   */
  deleteTodo(id: string): Promise<void>;

  /**
   * 渲染图表
   * @param type
   * @param code
   * @param options
   */
  renderDiagram(
    type: string,
    code: string,
    options?: Record<string, string>,
  ): Promise<Diagram>;
}
