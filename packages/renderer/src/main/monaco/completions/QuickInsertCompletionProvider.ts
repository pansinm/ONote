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
    const lineContent = model.getLineContent(position.lineNumber);
    const lineTextBefore = lineContent.substring(0, position.column - 1);
    const startIndex = lineTextBefore.lastIndexOf('@');

    if (startIndex < 0) {
      return {
        suggestions: [],
      };
    }

    // range 应该只包含 @ 字符本身，从 startIndex + 1 开始，到 startIndex + 2 结束
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column - 1,
    );
    return {
      suggestions: [
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '',
          command: {
            id: 'onote.command.insertDate',
            title: '插入日期',
            arguments: [model, range],
          },
          label: '插入日期',
          filterText: '@riqi date insert',
          range,
        },
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '',
          command: {
            id: 'onote.command.insertTime',
            title: '插入时间',
            arguments: [model, range],
          },
          label: '插入时间',
          filterText: '@shijian time insert',
          range,
        },
      ],
    };
  }
}

export default QuickInsertCompletionItemProvider;
