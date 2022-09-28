import * as monaco from 'monaco-editor';

class QuickInsertCompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = ['@'];

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .substring(0, position.column);
    const startIndex = lineTextBefore.lastIndexOf('@');

    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column,
    );
    return {
      suggestions: [
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '',
          command: {
            id: 'onote.command.insertDate',
            title: '插入日期',
          },
          label: '插入日期',
          filterText: '@riqi date insert',
          range,
        },
      ],
    };
  }
}

export default QuickInsertCompletionItemProvider;
