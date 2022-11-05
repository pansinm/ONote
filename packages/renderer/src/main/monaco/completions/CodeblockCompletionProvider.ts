import * as monaco from 'monaco-editor';
import _ from 'lodash';
import { getTextAfter, getTextBefore, isInFence } from '../utils';

class CodeblockCompletionProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = ['`'];

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const line = model.getLineContent(position.lineNumber);
    const last = model.getLineLastNonWhitespaceColumn(position.lineNumber);

    if (!/^\s*```.*/.test(line)) {
      return;
    }
    const inFence = isInFence(model, position, '');

    const buildInsertText = (id: string) => {
      const tag = '```';
      let insertText = `${id}`;
      if (!inFence) {
        insertText += `\n$1\n$0${tag}`;
      }
      return insertText;
    };
    const range = new monaco.Range(
      position.lineNumber,
      line.lastIndexOf('`') + 2,
      position.lineNumber,
      last,
    );

    const suggestions = monaco.languages
      .getLanguages()
      .map((lan) => lan.id)
      .map(
        (id) =>
          ({
            kind: monaco.languages.CompletionItemKind.Enum,
            insertText: buildInsertText(id),
            label: id,
            range,
            preselect: true,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          } as monaco.languages.CompletionItem),
      );

    return {
      suggestions,
    };
  }
}

export default CodeblockCompletionProvider;
