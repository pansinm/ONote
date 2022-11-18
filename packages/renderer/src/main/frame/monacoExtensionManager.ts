import * as monaco from 'monaco-editor';

const _monaco = monaco;

interface IMonacoExtension {
  activate(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: typeof _monaco,
  ): void;
  dispose(): void;
}

class MonacoExtensionManager {
  extensions: IMonacoExtension[] = [];
  registerMonacoExtension(extension: IMonacoExtension) {
    this.extensions.push(extension);
  }
}

export default new MonacoExtensionManager();
