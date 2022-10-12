import QuickInsertCompletionItemProvider from './QuickInsertCompletionProvider';
import EmojiCompletionProvider from './EmojiCompletionProvider';
import * as monaco from 'monaco-editor';

monaco.languages.getLanguages().forEach((lan) => {
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new QuickInsertCompletionItemProvider(),
  );
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new EmojiCompletionProvider(),
  );
});
