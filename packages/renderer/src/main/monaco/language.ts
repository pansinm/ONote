import * as monaco from 'monaco-editor';
import MDLinkProvider from './links/MdLinkProvider';

monaco.languages.register({ id: 'vs.editor.nullLanguage' });
monaco.languages.setLanguageConfiguration('vs.editor.nullLanguage', {});
monaco.languages.registerLinkProvider('markdown', new MDLinkProvider());
