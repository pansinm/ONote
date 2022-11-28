import * as monaco from 'monaco-editor';

const _monaco = monaco;

interface IMonacoExtension {
  active(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: typeof _monaco,
  ): monaco.IDisposable;
}

class MonacoExtensionManager {
  extensions: IMonacoExtension[] = [];
  registerMonacoExtension(extension: IMonacoExtension) {
    this.extensions.push(extension);
  }

  activeAll(editor: monaco.editor.IStandaloneCodeEditor) {
    const disposers = this.extensions.map((extension) =>
      extension.active(editor, monaco),
    );
    return {
      dispose: () => disposers.forEach((disposer) => disposer.dispose()),
    };
  }
}

export default new MonacoExtensionManager();
