import * as monaco from 'monaco-editor';
import * as Emoji from 'node-emoji';
import { isInFence } from '../utils';

function generateSuggestions(range: monaco.Range) {
  return Object.keys(Emoji.emoji).map((key) => {
    return {
      kind: monaco.languages.CompletionItemKind.Color,
      insertText: ':' + key + ':',
      label: Emoji.get(key) + ':' + key + ':',
      filterText: `:${key}: ：${key}`,
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
    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .substring(0, position.column);
    const startIndex = lineTextBefore.lastIndexOf(':');

    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column,
    );

    if (/:[^:\s]+:$/.test(lineTextBefore)) {
      return {
        suggestions: [],
      };
    }
    if (startIndex < 0) {
      return { suggestions: [] };
    }

    return {
      suggestions: generateSuggestions(range),
    };
  }
}

export default EmojiCompletionProvider;
