import * as monaco from 'monaco-editor';
import * as Emoji from 'node-emoji';
import { isInFence } from '../utils';

function generateSuggestions(text: string, range: monaco.Range) {
  return Object.keys(Emoji.emoji)
    .filter((key) => key.includes(text))
    .map((key) => {
      return {
        kind: monaco.languages.CompletionItemKind.Color,
        insertText: ':' + key + ':',
        label: Emoji.get(key) + ':' + key + ':',
        // filterText: `:${key}:`,
        detail: Emoji.get(key),
        range,
      } as monaco.languages.CompletionItem;
    });
}

class EmojiCompletionProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = [':'];

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    if (isInFence(model, position, '')) {
      return;
    }
    const lineText = model.getLineContent(position.lineNumber);

    const lineTextBefore = lineText.substring(0, position.column);

    const startIndex = lineTextBefore.lastIndexOf(':');
    const matchText = lineText.slice(startIndex + 1, position.column);
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column,
    );

    if (lineText[startIndex - 1] === ':') {
      return {
        suggestions: [],
      };
    }

    if (startIndex < 0) {
      return { suggestions: [] };
    }

    return {
      suggestions: generateSuggestions(matchText, range),
    };
  }
}

export default EmojiCompletionProvider;
