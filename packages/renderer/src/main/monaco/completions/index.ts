import QuickInsertCompletionItemProvider from './QuickInsertCompletionProvider';
import EmojiCompletionProvider from './EmojiCompletionProvider';
import * as monaco from 'monaco-editor';
import CodeblockCompletionProvider from './CodeblockCompletionProvider';
import PathCompletionProvider from './PathCompletionProvider';
import TextDirectiveCompletionProvider from './TextDirectiveCompletionProvider';
import { completionLanguageSelector } from './languages';

const quickInsertCompletionProvider = new QuickInsertCompletionItemProvider();

monaco.languages.registerCompletionItemProvider(
  completionLanguageSelector,
  quickInsertCompletionProvider,
);

monaco.languages.registerCompletionItemProvider(
  completionLanguageSelector,
  new TextDirectiveCompletionProvider(),
);
monaco.languages.registerCompletionItemProvider(
  completionLanguageSelector,
  new EmojiCompletionProvider(),
);
monaco.languages.registerCompletionItemProvider(
  completionLanguageSelector,
  new CodeblockCompletionProvider(),
);
monaco.languages.registerCompletionItemProvider(
  completionLanguageSelector,
  new PathCompletionProvider(),
);

export default quickInsertCompletionProvider;
