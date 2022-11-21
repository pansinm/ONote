import * as monaco from 'monaco-editor';

const _monaco = monaco;

interface IMonacoExtension {
  active(
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

  activeAll(editor: monaco.editor.IStandaloneCodeEditor) {
    this.extensions.forEach((extension) => extension.active(editor, monaco));
  }

  disposeAll() {
    this.extensions.forEach((extension) => extension?.dispose());
  }
}

export default new MonacoExtensionManager();
