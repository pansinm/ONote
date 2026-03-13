import * as monaco from 'monaco-editor';
import { isInFence } from '../utils';

const DIRECTIVES = [{ label: ':tag', insertText: ':tag[$1]', detail: '文本标签' }];

class TextDirectiveCompletionProvider implements monaco.languages.CompletionItemProvider {
  triggerCharacters = [':'];

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    if (isInFence(model, position, '')) {
      return;
    }
    const lineText = model.getLineContent(position.lineNumber);
    const lineTextBefore = lineText.substring(0, position.column);
    const startIndex = lineTextBefore.lastIndexOf(':');

    if (startIndex < 0 || lineText[startIndex - 1] === ':') {
      return { suggestions: [] };
    }

    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column,
    );

    return {
      suggestions: DIRECTIVES.map((d) => ({
        kind: monaco.languages.CompletionItemKind.Snippet,
        label: d.label,
        insertText: d.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: d.detail,
        filterText: d.label,
        range,
      })),
    };
  }
}

export default TextDirectiveCompletionProvider;
