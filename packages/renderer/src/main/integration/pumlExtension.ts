import type * as monaco from 'monaco-editor';
import type { IEditorExtension } from '@sinm/onote-plugin/main';
import { monacoExtensionManager } from '../frame';
import { PUmlExtension } from '@sinm/monaco-plantuml';

class Extension implements IEditorExtension {
  active(editor: monaco.editor.IStandaloneCodeEditor) {

    const worker = new Worker(new URL('./puml.worker.ts', import.meta.url));
    const disposer = new PUmlExtension(worker).active(editor as any);
    return {
      dispose: () => {
        disposer.dispose();
        worker.terminate();
      },
    };
  }
}

monacoExtensionManager.registerMonacoExtension(new Extension());
