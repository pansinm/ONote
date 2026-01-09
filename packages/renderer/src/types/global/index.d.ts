import type { onote } from '../../../../electron/src/preload/main/onote';
import type { simmer } from '../../../../electron/src/preload/main/simmer';

declare global {
  interface Window {
    onote: typeof onote;
    simmer: typeof simmer;
    nodeCrypto: {
      randomBytes: (size: number) => Buffer;
    };
  }
}

declare module 'github-markdown-css';

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
