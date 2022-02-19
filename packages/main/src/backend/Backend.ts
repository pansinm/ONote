import type { IBackend, Note, Notepad, RequireKey, TODO } from './types';

class Backend implements IBackend {
  private backend: IBackend;
  constructor(backend: IBackend) {
    this.backend = backend;
  }
  fetchNotesByNotepadId(notepadId: string): Promise<Note[]> {
    return this.backend.fetchNotesByNotepadId(notepadId);
  }

  fetchNotepads() {
    return this.backend.fetchNotepads();
  }
  createNotepad(notepad: RequireKey<Partial<Notepad>, 'name'>) {
    return this.backend.createNotepad(notepad);
  }
  updateNotepad(notepadId: string, notepad: Partial<Notepad>) {
    return this.backend.updateNotepad(notepadId, notepad);
  }
  deleteNotepad(notepadId: string) {
    return this.backend.deleteNotepad(notepadId);
  }
  fetchNodesByNotepadId(notepadId: string) {
    return this.backend.fetchNotesByNotepadId(notepadId);
  }
  createNote(note: Parameters<IBackend['createNote']>[0]) {
    return this.backend.createNote(note);
  }
  deleteNote(noteId: string) {
    return this.backend.deleteNote(noteId);
  }
  updateNote(noteId: string, note: Partial<Note>) {
    return this.backend.updateNote(noteId, note);
  }
  readResource(uri: string) {
    return this.backend.readResource(uri);
  }
  saveResource(uri: string, content: string, curVersion: number) {
    return this.backend.saveResource(uri, content, curVersion);
  }
  fetchTodos() {
    return this.backend.fetchTodos();
  }
  createTodo(todo: Parameters<IBackend['createTodo']>[0]) {
    return this.backend.createTodo(todo);
  }
  deleteTodo(id: string) {
    return this.backend.deleteTodo(id);
  }

  renderDiagram(type: string, code: string, options: any) {
    return this.backend.renderDiagram(type, code, options);
  }

  setBackend(backend: IBackend) {
    this.backend = backend;
  }
}

export default Backend;
