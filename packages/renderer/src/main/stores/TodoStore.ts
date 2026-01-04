import { nanoid } from 'nanoid';
import type ActivationStore from './ActivationStore';

import { makeAutoObservable, reaction } from 'mobx';
import fileService from '../services/fileService';
import { getFileName } from '@sinm/react-file-tree/lib/utils';
import _ from 'lodash';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('TodoStore');

export interface ITag {
  name: string;
  color?: string;
}

export interface ITask {
  description?: string;
  id: string;
  title: string;
  tags?: string[];
  dueDate?: string;
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
    this.startJob();
  }

  private async startJob() {
    const cronId = await window.onote.cron.invoke('startJob', '0 0 9,13 * * *');
    window.onote.cron.addListener('ticked', ({ id }: { id: number }) => {
      logger.debug('Cron ticked', { cronId, id });
      if (cronId === id) {
        this.notify();
      }
    });
  }

  private notify() {
    const tasks = Object.values(this.tasksById).filter(
      (item) => !item.done && item.dueDate,
    );
    logger.debug('Due tasks checked', { count: tasks.length });
    const now = new Date();
    const dueTasks = tasks.filter((item) => {
      const due = new Date(item.dueDate!);
      return (
        new Date(now.toLocaleDateString()) >= due &&
        now.getTime() > due.getTime()
      );
    });

    if (!dueTasks.length) {
      return;
    }
    const notification = new Notification('ONote', {
      body: `今天有 ${dueTasks.length} 个任务未完成`,
    });

    notification.onclick = () => {
      window.focus();
    };
  }

  filter = {
    timeRange: 'all' as 'all' | 'today' | 'tomorrow' | 'week' | 'month',
    tab: 'all' as 'all' | 'todo' | 'done',
    tags: [] as string[],
  };

  setFilterTimeRange(range: 'all' | 'today' | 'tomorrow' | 'week' | 'month') {
    this.filter.timeRange = range;
  }

  setFilterTab(tab: 'all' | 'todo' | 'done') {
    this.filter.tab = tab;
  }

  setFilterTags(tags: string[]) {
    this.filter.tags = tags;
  }

  taskFiles: Record<string, Record<string, ITask>> = {};

  get tasksById(): Record<string, ITask> {
    return Object.keys(this.taskFiles)
      .map((key) => Object.values(this.taskFiles[key]))
      .flat()
      .reduce((p, c) => ({ ...p, [c.id]: c }), {});
  }

  get tasks(): ITask[] {
    const all = Object.values(this.tasksById);
    const filtered = all
      .filter((item) => {
        if (this.filter.tags.length > 0) {
          return this.filter.tags.some((tag) => item.tags?.includes(tag));
        }
        return true;
      })
      .filter((item) => {
        const range = this.filter.timeRange;
        if (range === 'all') {
          return true;
        }
        const time = item.done ? item.doneAt : item.createdAt;
        const now = Date.now();
        if (range === 'today') {
          return time > now - 1000 * 60 * 60 * 24;
        }
        if (range === 'tomorrow') {
          return (
            time > now - 1000 * 60 * 60 * 24 && time < now + 1000 * 60 * 60 * 24
          );
        }
        if (range === 'week') {
          return time > now - 1000 * 60 * 60 * 24 * 7;
        }
        if (range === 'month') {
          return time > now - 1000 * 60 * 60 * 24 * 30;
        }
      })
      .filter((item) => {
        const tab = this.filter.tab;
        if (tab === 'all') {
          return true;
        }
        if (tab === 'done') {
          return item.done;
        }
        return !item.done;
      });
    return _.orderBy(
      filtered,
      ['done', 'doneAt', 'createdAt'],
      ['asc', 'desc', 'desc'],
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

  createTag(name: string, color?: string) {
    this.tagRecords[name] = { name, color };
    this.saveTagFile();
  }

  removeTag(tagName: string) {
    delete this.tagRecords[tagName];
    this.tagRecords = { ...this.tagRecords };
    this.saveTagFile();
  }

  private saveTagFile() {
    fileService.writeText(
      this.tagFileUri,
      JSON.stringify(this.tagRecords, null, 2),
    );
  }
  createTask(text: string, options: Partial<ITask> = {}) {
    const { file, records } = this.currentFile;
    const task: ITask = {
      tags: [],
      done: false,
      description: '',
      filename: file,
      ref: '',
      ...options,
      doneAt: 0,
      createdAt: Date.now(),
      id: nanoid(),
      title: text,
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

  updateTask(taskId: string, options: Partial<ITask> = {}) {
    const task = this.tasksById[taskId];
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

  private get tagFileUri() {
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
      const tagsJson = await fileService.readText(this.tagFileUri);
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

  activate(filter: Partial<typeof this.filter> = {}) {
    this.filter = { ...this.filter, ...filter };
    this.activationStore.activatePage('todo');
  }
}

export default TodoStore;
