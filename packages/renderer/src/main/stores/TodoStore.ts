import { nanoid } from 'nanoid';
import type ActivationStore from './ActivationStore';

import { makeAutoObservable, reaction } from 'mobx';
import fileService from '../services/fileService';
import { getFileName } from '@sinm/react-file-tree/lib/utils';
import _ from 'lodash';

export interface ITag {
  name: string;
  color?: string;
}

export interface ITask {
  description?: string;
  id: string;
  title: string;
  tags?: ITag[];
  done: boolean;
  filename: string;
  ref?: string;
  doneAt: number;
  createdAt: number;
}

class TodoStore {
  constructor(private activationStore: ActivationStore) {
    makeAutoObservable(this);
    reaction(
      () => activationStore.rootUri,
      () => this.load(),
    );
  }

  taskFiles: Record<string, Record<string, ITask>> = {};

  get tasksById(): Record<string, ITask> {
    return Object.keys(this.taskFiles)
      .map((key) => Object.values(this.taskFiles[key]))
      .flat()
      .reduce((p, c) => ({ ...p, [c.id]: c }), {});
  }

  get tasks(): ITask[] {
    return _.orderBy(
      Object.values(this.tasksById),
      ['done', 'createdAt'],
      ['asc', 'desc'],
    );
  }

  tagRecords: Record<string, ITag> = {};

  get tags(): ITag[] {
    return Object.values(this.tagRecords);
  }

  get currentFile() {
    const files = Object.keys(this.taskFiles);
    const latest = files.sort().pop();
    if (
      latest &&
      this.taskFiles[latest] &&
      Object.keys(this.taskFiles[latest]).length < 1000 // 每个文件存1000条记录
    ) {
      return {
        file: latest,
        records: this.taskFiles[latest],
      };
    }
    return {
      file: 'tasks-' + Date.now() + '.json',
      records: {},
    };
  }

  createTask(text: string, options: { ref?: string; tags?: ITag[] } = {}) {
    const { file, records } = this.currentFile;
    const task: ITask = {
      id: nanoid(),
      title: text,
      tags: [],
      done: false,
      description: '',
      filename: file,
      ref: '',
      doneAt: 0,
      createdAt: Date.now(),
      ...options,
    };
    records[task.id] = task;
    this.taskFiles[file] = { ...records };
    this.saveTaskFile(file);
    return task;
  }

  removeTask(taskId: string) {
    const task = this.tasksById[taskId];
    if (task) {
      const file = task.filename;
      const records = this.taskFiles[file];
      delete records[taskId];
      this.taskFiles[file] = { ...records };
      this.saveTaskFile(file);
    }
  }

  updateTask(
    task: ITask,
    options: {
      ref?: string;
      tags?: ITag[];
      done?: boolean;
      title?: string;
      content?: string;
    } = {},
  ) {
    const file = task.filename;
    const records = this.taskFiles[file];
    if (task.id) {
      records[task.id] = { ...records[task.id], ...options };
      if (options.done) {
        records[task.id].doneAt = Date.now();
      }
      this.taskFiles[file] = { ...records };
      this.saveTaskFile(file);
    }
  }

  private saveTaskFile(filename: string) {
    fileService.writeText(
      this.taskRootUri + '/' + filename,
      JSON.stringify(this.taskFiles[filename]),
    );
  }

  private get taskFileUri() {
    const todoRoot = this.activationStore.rootUri + '/.onote/todo';
    return todoRoot + '/tags.json';
  }

  private get taskRootUri() {
    const todoRoot = this.activationStore.rootUri + '/.onote/todo/tasks';
    return todoRoot;
  }

  async load() {
    if (!this.activationStore.rootUri) {
      this.taskFiles = {};
      this.tagRecords = {};
    }
    try {
      const tagsJson = await fileService.readText(this.taskFileUri);
      this.tagRecords = JSON.parse(tagsJson);
    } catch (err) {
      // ignore
    }
    try {
      const files = await fileService.listDir(this.taskRootUri);
      for (const file of files.filter((file) => file.uri.endsWith('.json'))) {
        const tasksJson = await fileService.readText(file.uri);
        const filename = getFileName(file.uri);
        this.taskFiles[filename] = JSON.parse(tasksJson);
      }
    } catch (err) {
      // ignore
    }
  }

  activate(timeRange?: [number, number], tags?: string[]) {
    this.activationStore.activatePage('todo');
  }
}

export default TodoStore;
