import * as monaco from 'monaco-editor';
import { call } from './callWorker';

class PumlSignatureHelpProvider
  implements monaco.languages.SignatureHelpProvider
{
  signatureHelpTriggerCharacters?: readonly string[] | undefined = ['('];
  signatureHelpRetriggerCharacters?: readonly string[] | undefined = [','];

  async provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken,
    context: monaco.languages.SignatureHelpContext,
  ): Promise<monaco.languages.SignatureHelpResult | null | undefined> {
    const range = new monaco.Range(1, 1, position.lineNumber, position.column);
    const textBefore = model.getValueInRange(range);
    const start = textBefore.lastIndexOf('```plantuml');
    const text = model.getValue();
    let fence = text.slice(start);
    fence = fence.slice(0, fence.indexOf('```\n'));
    fence = fence.replace(/```plantuml.*?\n/, '');
    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);
    const res = /([$a-zA-Z0-9_]+?)\([^)]*$/.exec(lineTextBefore);
    const name = res?.[1];
    const node = name && ((await call('callable', fence, name)) as any);
    if (node) {
      const parameters = node.arguments.map((arg: any) => ({
        label: arg.name.name,
        documentation: `${node.name.name}(${node.arguments
          .map(
            (arg: any) =>
              `${arg.name.name}${arg.init ? (arg.init as any).text : ''}`,
          )
          .join(', ')})`,
      }));

      return {
        value: {
          activeParameter: 0,
          activeSignature: 0,
          signatures: [
            {
              label: node.name.name,
              parameters: parameters,
              activeParameter: 0,
            },
          ],
        },
        dispose() {
          // nothing
        },
      };
    }
  }
}

monaco.languages.registerSignatureHelpProvider(
  'markdown',
  new PumlSignatureHelpProvider(),
);
