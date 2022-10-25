import * as monaco from 'monaco-editor';
import PumlFile from './PumlFile';
import { preprocessSnippets } from './snippets';
import stdlib from './stdlib';

stdlib.resolve();

function alphabet(from: string, to: string) {
  const charF = from.charCodeAt(0);
  const charT = from.charCodeAt(0);
  const arr: string[] = [];
  for (let char = charF; char <= charT; char++) {
    arr.push(String.fromCharCode(char));
  }
  return arr;
}

class UMLCompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  preprocessorItems(
    lineTextBefore: string,
    position: monaco.Position,
  ): monaco.languages.CompletionItem[] {
    const startIndex = lineTextBefore.lastIndexOf('!');
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column,
    );
    const items = Object.values(preprocessSnippets)
      .filter((snippet) => {
        return snippet.prefix.includes(lineTextBefore);
      })
      .map((snippet) => {
        return {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: snippet.body,
          range,
          label: snippet.label,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        };
      });
    return items;
  }

  includeItems(
    lineTextBefore: string,
    position: monaco.Position,
  ): Promise<monaco.languages.CompletionItem[]> {
    const startIndex = lineTextBefore.lastIndexOf('<');
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 2,
      position.lineNumber,
      position.column,
    );
    const preText = lineTextBefore.slice(startIndex + 1);
    console.log(lineTextBefore, preText);
    return stdlib.resolve().then((items) => {
      return items
        .filter((item) => {
          return item.path.includes(preText);
        })
        .map((snippet) => {
          return {
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: snippet.path,
            range,
            label: '' + snippet.path,
          };
        });
    });
  }
  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const range = new monaco.Range(1, 1, position.lineNumber, position.column);
    const textBefore = model.getValueInRange(range);
    const start = textBefore.lastIndexOf('```plantuml');
    const end = textBefore.lastIndexOf('```\n');
    if (start < 0 || start <= end) {
      return;
    }
    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);

    if (/!include\s*</.test(lineTextBefore)) {
      return this.includeItems(lineTextBefore, position).then((items) => {
        return { suggestions: items };
      });
    }

    const text = model.getValue();
    let fence = text.slice(start);
    fence = fence.slice(0, fence.indexOf('```\n'));
    fence = fence.replace(/```plantuml.*?\n/, '');
    const startIndex = lineTextBefore.lastIndexOf('<');
    const r = new monaco.Range(
      position.lineNumber,
      startIndex + 2,
      position.lineNumber,
      position.column,
    );

    const res = /([$a-zA-Z0-9_]+?)\(/.exec(lineTextBefore);
    if (res) {
      let startIndex = lineTextBefore.lastIndexOf('(');
      const cIndex = lineTextBefore.lastIndexOf(',');
      if (cIndex > startIndex) {
        startIndex = cIndex;
      }
      const r = new monaco.Range(
        position.lineNumber,
        startIndex + 2,
        position.lineNumber,
        position.column,
      );
      return new PumlFile(fence).arguments(res[1], r).then((sug) => {
        console.log(sug);
        return { suggestions: sug };
      });
    }

    if (/^\s*![^\s]*/.test(lineTextBefore)) {
      return { suggestions: this.preprocessorItems(lineTextBefore, position) };
    }

    return new PumlFile(fence)
      .suggestions(r)
      .then((sug) => ({ suggestions: sug }));
  }

  triggerCharacters = alphabet('a', 'z')
    .concat(alphabet('A', 'Z'))
    .concat(['$', '/', ' ', '!', '<', '(', ',']);
}

monaco.languages.registerCompletionItemProvider(
  'markdown',
  new UMLCompletionItemProvider(),
);
