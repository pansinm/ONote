import type { Engine } from '@hpcc-js/wasm';
import * as monaco from 'monaco-editor';
import stores from '../main/stores';
import Server from './Server';

const server = new Server();

server.handle('renderGraphviz', (dotSource: string, engine: Engine) => {
  return window.simmer.renderGraphviz(dotSource, engine);
});

server.handle('renderPlantUML', (uml: string) => {
  return window.simmer.renderPlantUML(uml, 'https://www.plantuml.com/plantuml');
});

server.handle('copyImage', (dataUrl: any, type: 'dataURL' | 'ArrayBuffer') => {
  return window.simmer.copyImage(dataUrl, type);
});

server.handle('openExternal', async (url: string) => {
  window.simmer.openExternal(url);
});

server.handle('deleteTodo', async (uri, title) => {
  const [, note] = /notes\/(.*?)\//.exec(uri) || [];
  if (note) {
    const todo = stores.todoStore.todos.find(
      (todo) => todo?.note?.id === note && todo.title === title,
    );
    if (todo) {
      stores.deleteTodo(todo.id);
    }
  }
});

server.handle('ensureTodo', async (uri, title, status) => {
  const [, note] = /notes\/(.*?)\//.exec(uri) || [];
  if (note) {
    const todo = stores.todoStore.todos.find(
      (todo) => todo?.note?.id === note && todo.title === title,
    );
    if (todo) {
      stores.updateTodo(todo.id, { status });
    } else {
      stores.createTodo({ title, note: { id: note }, status });
    }
  }
});

server.handle(
  'replaceText',
  async (uri: string, range: monaco.Range, text: string) => {
    const model = monaco.editor.getModel(monaco.Uri.parse(uri));
    if (model) {
      model.applyEdits([
        {
          range,
          text,
        },
      ]);
    }
  },
);

export default server;
