import * as monaco from 'monaco-editor';
import './language';
import './worker';
import './commands';
import './completions';
export * from './editor';

console.log('------', monaco);
(window as any).monaco = monaco;
