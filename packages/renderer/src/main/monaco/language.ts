import * as monaco from 'monaco-editor';

monaco.languages.register({ id: 'vs.editor.nullLanguage' });
monaco.languages.setLanguageConfiguration('vs.editor.nullLanguage', {});
