import type * as monaco from 'monaco-editor';
import type { IEditorExtension } from '@sinm/onote-plugin/main';
import { monacoExtensionManager } from '../frame';
import { PUmlExtension } from '@sinm/monaco-plantuml';
import pumlWorker from '@sinm/monaco-plantuml/lib/puml.worker?worker';

class Extension implements IEditorExtension {
  active(editor: monaco.editor.IStandaloneCodeEditor) {
    const worker = new pumlWorker();
    const disposer = new PUmlExtension(worker).active(editor);
    return {
      dispose: () => {
        disposer.dispose();
        worker.terminate();
      },
    };
  }
}

monacoExtensionManager.registerMonacoExtension(new Extension());
