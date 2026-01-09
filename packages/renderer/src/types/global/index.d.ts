import type { onote } from '../../../../electron/src/preload/main/onote';

interface globalThis {
  onote: typeof onote;
  simmer: any;
  nodeCrypto: {
    randomBytes: (size: number) => Buffer;
  };
}

declare module 'github-markdown-css/github-markdown.css';

declare module 'react-markdown' {
  const ReactMarkdown: React.ComponentType<{
    children?: string;
    remarkPlugins?: any[];
  }>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}
