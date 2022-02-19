import { autorun, makeAutoObservable, reaction } from 'mobx';
import _ from 'lodash';
import ConfigStore from './ConfigStore';
import NotepadStore from './NotepadStore';
import NoteStore from './NoteStore';
import type { AvailableResource } from './ActivationStore';
import ResourceStore from './ActivationStore';
import TagStore from './TagStore';
import { uri2fsPath } from '../../utils/uri';
import type { TODO } from './TodoStore';
import TodoStore from './TodoStore';

/**
 * 管理所有的交互
 */
class Root {
  configStore = new ConfigStore();
  tagStore = new TagStore(this.configStore);
  notepadStore = new NotepadStore(this.configStore);
  noteStore = new NoteStore(this.configStore);
  activationStore = new ResourceStore(this.noteStore);
  todoStore = new TodoStore();

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.configStore.config.root,
      (root) => {
        if (root) {
          this.todoStore.load(root + '/todos/todos.yaml');
        }
      },
    );
  }

  /**
   * 打开目录
   * @param folder
   */
  openFolder(folder: string) {
    this.configStore.setRoot(folder);
  }

  /**
   * 创建笔记本
   * @param name
   */
  createNotepad(name: string) {
    this.notepadStore.createNotepad({ name, count: 0 });
  }

  /**
   * 重命名笔记本
   * @param id
   * @param newName
   */
  renameNotepad(id: string, newName: string) {
    this.notepadStore.update(id, { name: newName });
  }

  /**
   * 删除记事本
   * @param notepadId
   */
  async deleteNotePad(notepadId: string) {
    // 删除该笔记本下所有笔记
    const needDelNotes = this.noteStore.groupByNotepad[notepadId] || [];
    for (const note of needDelNotes) {
      // 删除文件
      await this.deleteNote(note.id);
    }
    // 删除笔记本
    this.notepadStore.delete(notepadId);
  }

  /**
   * 创建笔记
   * @param name
   */
  createNote(name: string) {
    // ...
  }

  /**
   * 删除笔记
   * @param noteId
   * @returns
   */
  async deleteNote(noteId: string) {
    this.closeResource((resource) => resource.uri.includes(noteId));
    this.noteStore.deleteNote(noteId);
    return window.simmer
      .remove([this.configStore.config.root, 'notes', noteId].join('/'))
      .catch(_.noop);
  }

  /**
   * 重命名笔记
   * @param name
   */
  renameNote(noteId: string, name: string) {
    this.noteStore.updateNote(noteId, { title: name });
  }

  /**
   * 移动笔记到其他笔记本
   * @param noteId
   * @param notepadId
   */
  moveNoteTo(noteId: string, notepadId: string) {
    this.noteStore.updateNote(noteId, { notepad: notepadId });
  }
  /**
   * 导入markdown
   * @param filepath
   */
  importMarkdown(notepadId: string, filepath: string) {
    // ...
  }

  // 导入目录内所有markdown文件
  importAllMarkdown(notepadId: string, folder: string) {
    // ...
  }

  /**
   * 创建标签
   * @param name
   */
  createTag(name: string) {
    // ...
  }

  /**
   * 删除标签
   * @param name
   */
  deleteTag(name: string) {
    // ...
  }

  /**
   * 为笔记添加标签
   * @param noteId
   * @param tagName
   */
  addTag(noteId: string, tagName: string) {
    // ...
  }

  /**
   * 为笔记删除标签
   * @param noteId
   * @param tagName
   */
  removeTag(noteId: string, tagName: string) {
    // ...
  }

  closeResource(
    uriOrFilter: string | ((resource: AvailableResource) => boolean),
  ) {
    if (typeof uriOrFilter === 'string') {
      this.activationStore.closeResource(uriOrFilter);
    } else {
      const needCloseResources = this.activationStore.openedResources.filter(
        (resource) => uriOrFilter(resource),
      );
      for (const resource of needCloseResources) {
        this.activationStore.closeResource(resource.uri);
      }
    }
  }

  /**
   * 保存文件
   * @param uri
   */
  async saveFile(uri: string, content: string) {
    await window.simmer.writeFile(uri2fsPath(uri), content);
    this.activationStore.markResourceUnsaved(uri, false);
  }

  /**
   * 显示或隐藏侧边栏
   */
  toggleSidebar() {
    this.activationStore.toggleSidebar();
  }

  deleteTodo(id: string) {
    this.todoStore.deleteTodo(id);
  }

  createTodo(todo: Partial<Exclude<TODO, 'id'>>) {
    this.todoStore.createTodo(todo);
  }

  updateTodo(id: string, content: Partial<Exclude<TODO, 'id'>>) {
    this.todoStore.updateTodo(id, content);
  }
}

export default Root;
