import * as monaco from 'monaco-editor';
import './language';
import './worker';
import './commands';
import './completions';
import './languages/plantuml/service/puml';
export * from './editor';

(window as any).monaco = monaco;
