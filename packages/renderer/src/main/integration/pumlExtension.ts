import type * as monaco from 'monaco-editor';
import type { IEditorExtension } from '@sinm/onote-plugin/main';
import { monacoExtensionManager } from '../frame';
import { PUmlExtension } from '@sinm/monaco-plantuml';
import pumlWorker from '@sinm/monaco-plantuml/lib/puml.worker?worker';

class Extension implements IEditorExtension {
  worker?: Worker;
  disposer?: monaco.IDisposable;
  active(editor: monaco.editor.IStandaloneCodeEditor) {
    this.worker = new pumlWorker();
    this.disposer = new PUmlExtension(this.worker).active(editor);
  }
  dispose() {
    this.worker?.terminate();
    this.disposer?.dispose();
  }
}

monacoExtensionManager.registerMonacoExtension(new Extension());
