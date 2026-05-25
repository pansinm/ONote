import * as monaco from 'monaco-editor';
import i18next from '../../i18n';

class QuickInsertCompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = ['@'];

  private triggerSuggest?: () => void;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  registerTriggerSuggest(triggerSuggest: () => void) {
    this.triggerSuggest = triggerSuggest;
  }

  refreshTriggerSuggest() {
    if (!this.triggerSuggest) {
      return;
    }

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.triggerSuggest?.();
      this.refreshTimer = undefined;
    }, 0);
  }

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

    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column - 1,
    );
    const t = i18next.t.bind(i18next);
    return {
      suggestions: [
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '',
          command: {
            id: 'onote.command.insertDate',
            title: t('common:insertDate'),
            arguments: [model, range],
          },
          label: t('common:insertDate'),
          filterText: '@riqi date insert',
          range,
        },
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '',
          command: {
            id: 'onote.command.insertTime',
            title: t('common:insertTime'),
            arguments: [model, range],
          },
          label: t('common:insertTime'),
          filterText: '@shijian time insert',
          range,
        },
      ],
    };
  }
}

export default QuickInsertCompletionItemProvider;
