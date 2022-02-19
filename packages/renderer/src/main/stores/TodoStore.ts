import { v4 as uuid } from 'uuid';

import { makeAutoObservable, reaction } from 'mobx';
import YAML from 'yaml';

export type TODO = {
  id: string;
  title: string;
  status: 'doing' | 'done';
  createdAt: string;
  doneAt: string;
  note?: {
    id: string;
  };
  plan?: {
    startAt: string;
    deadline: string;
  };
};

class TodoStore {
  todos: TODO[] = [];

  configFilePath?: string;

  constructor() {
    makeAutoObservable(this);

    // 笔记本数据变化后，持久化
    reaction(
      () => this.todos,
      () => {
        this.save();
      },
      {
        delay: 1000,
      },
    );
  }

  async load(path: string) {
    this.configFilePath = path;
    const yaml = await window.simmer.readFile(path);
    this.todos = YAML.parse(yaml).todos;
  }

  async save() {
    const yaml = YAML.stringify({
      version: '0.1',
      todos: this.todos,
    });
    if (this.configFilePath) {
      await window.simmer.writeFile(this.configFilePath, yaml);
    }
  }

  createTodo(todo: Partial<Exclude<TODO, 'id'>>) {
    this.todos = [
      ...this.todos,
      {
        id: uuid(),
        status: 'doing',
        ...todo,
      } as TODO,
    ];
  }

  deleteTodo(id: string) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  updateTodo(id: string, content: Partial<Exclude<TODO, 'id'>>) {
    this.todos = this.todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          ...content,
        } as TODO;
      }
      return todo;
    });
  }
}

export default TodoStore;
