import * as monaco from 'monaco-editor';

class Manager {
  editor?: monaco.editor.IStandaloneCodeEditor;
  createEditor(container: HTMLElement) {
    const editor = monaco.editor.create(container, {
      value: '',
      language: 'markdown',
      fixedOverflowWidgets: true,
      // wordWrap: 'on',
      // theme: '',
      padding: {
        top: 10,
      },
      scrollbar: {
        verticalScrollbarSize: 8,
      },
      unicodeHighlight: {
        ambiguousCharacters: false,
      },
    });
    editor.onDidDispose(() => {
      if (editor === this.editor) {
        this.editor = undefined;
      }
    });
    this.editor = editor;
    return editor;
  }
  getEditor() {
    return this.editor;
  }
}

export default new Manager();
