import QuickInsertCompletionItemProvider from './QuickInsertCompletionProvider';
import EmojiCompletionProvider from './EmojiCompletionProvider';
import * as monaco from 'monaco-editor';
import CodeblockCompletionProvider from './CodeblockCompletionProvider';
import PathCompletionProvider from './PathCompletionProvider';
import TextDirectiveCompletionProvider from './TextDirectiveCompletionProvider';

monaco.languages.getLanguages().forEach((lan) => {
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new QuickInsertCompletionItemProvider(),
  );
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new TextDirectiveCompletionProvider(),
  );
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new EmojiCompletionProvider(),
  );
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new CodeblockCompletionProvider(),
  );
  monaco.languages.registerCompletionItemProvider(
    lan.id,
    new PathCompletionProvider(),
  );
});
