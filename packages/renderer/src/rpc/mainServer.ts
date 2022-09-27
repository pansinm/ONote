import type { Engine } from '@hpcc-js/wasm';
import * as monaco from 'monaco-editor';
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
