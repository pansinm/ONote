import * as monaco from 'monaco-editor';
import './language';
import './worker';
import './commands';
import './completions';
export * from './editor';

(window as any).monaco = monaco;
