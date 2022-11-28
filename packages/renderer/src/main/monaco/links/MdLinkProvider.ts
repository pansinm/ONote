import * as monaco from 'monaco-editor';
import stores from '../../stores';

class MDLinkProvider implements monaco.languages.LinkProvider {
  provideLinks(
    model: monaco.editor.ITextModel,
    token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.ILinksList> {
    const links = model
      .findMatches(
        '\\[[^\\]]*?\\]\\(([^\\)]+?)\\)',
        false,
        true,
        false,
        null,
        true,
      )
      .map((match) => {
        const [_, link] = match.matches || [];
        let url = new URL(link, model.uri.toString()).toString();
        if (link.startsWith('/')) {
          url = stores.activationStore.rootUri + link;
        }
        return {
          url,
          range: new monaco.Range(
            match.range.endLineNumber,
            match.range.endColumn - link.length - 1,
            match.range.endLineNumber,
            match.range.endColumn - 1,
          ),
        } as monaco.languages.ILink;
      });
    return {
      links: links,
      dispose() {
        // ignore
      },
    };
  }
}

export default MDLinkProvider;
