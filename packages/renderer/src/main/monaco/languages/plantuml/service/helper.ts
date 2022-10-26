import * as monaco from 'monaco-editor';

class PumlSignatureHelpProvider
  implements monaco.languages.SignatureHelpProvider
{
  signatureHelpTriggerCharacters?: readonly string[] | undefined = ['('];
  signatureHelpRetriggerCharacters?: readonly string[] | undefined = [','];

  provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken,
    context: monaco.languages.SignatureHelpContext,
  ): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {
    return {
      value: {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [
          {
            label: 'xxxx',
            parameters: [{ label: 'xx', documentation: 'xxx' }],
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

monaco.languages.registerSignatureHelpProvider(
  'markdown',
  new PumlSignatureHelpProvider(),
);
