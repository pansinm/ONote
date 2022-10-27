import * as monaco from 'monaco-editor';
import { findPreviousMatch, getFenceContent, isInFence } from '../../../utils';
import { allkeywords, preprocessor } from './hightlight';
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

const ALL_THEMES = [
  '_none_',
  'amiga',
  'aws-orange',
  'black-knight',
  'bluegray',
  'blueprint',
  'carbon-gray',
  'cerulean',
  'cerulean-outline',
  'crt-amber',
  'crt-green',
  'cyborg',
  'cyborg-outline',
  'hacker',
  'lightgray',
  'mars',
  'materia',
  'materia-outline',
  'metal',
  'mimeograph',
  'minty',
  'plain',
  'reddress-darkblue',
  'reddress-darkgreen',
  'reddress-darkorange',
  'reddress-darkred',
  'reddress-lightblue',
  'reddress-lightgreen',
  'reddress-lightorange',
  'reddress-lightred',
  'sandstone',
  'silver',
  'sketchy',
  'sketchy-outline',
  'spacelab',
  'spacelab-white',
  'superhero',
  'superhero-outline',
  'toy',
  'united',
  'vibrant',
];

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

  completeTheme(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const prevSpace = findPreviousMatch(model, position, /\s+/);
    if (!prevSpace) {
      return;
    }
    const range = new monaco.Range(
      position.lineNumber,
      prevSpace.range.endColumn,
      position.lineNumber,
      position.column,
    );
    return {
      suggestions: ALL_THEMES.map((theme) => ({
        kind: monaco.languages.CompletionItemKind.Color,
        insertText: theme,
        range,
        label: '' + theme,
      })),
    };
  }

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    if (!isInFence(model, position, 'plantuml')) {
      return;
    }

    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);

    if (context.triggerCharacter === '!') {
      const startIndex = lineTextBefore.lastIndexOf('!');
      const r = new monaco.Range(
        position.lineNumber,
        startIndex + 1,
        position.lineNumber,
        position.column,
      );
      return {
        suggestions: preprocessor.map((pre) => {
          return {
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: pre + ' ',
            range: r,
            label: pre,
          };
        }),
      };
    }

    if (/!include\s*</.test(lineTextBefore)) {
      return this.includeItems(lineTextBefore, position).then((items) => {
        return { suggestions: items };
      });
    }

    if (/!theme\s+/.test(lineTextBefore)) {
      return this.completeTheme(model, position);
    }

    const fence = getFenceContent(model, position);

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

    const r = new monaco.Range(
      position.lineNumber,
      position.column - 1,
      position.lineNumber,
      position.column,
    );
    const keywords = allkeywords.map((kw) => ({
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: kw,
      range: r,
      label: kw,
    }));
    return new PumlFile(fence)
      .suggestions(r)
      .then((sug) => ({ suggestions: sug.concat(keywords) }));
  }

  triggerCharacters = alphabet('a', 'z')
    .concat(alphabet('A', 'Z'))
    .concat(['$', '/', '!', '<', '(', ',', '@']);
}

monaco.languages.registerCompletionItemProvider(
  'markdown',
  new UMLCompletionItemProvider(),
);
