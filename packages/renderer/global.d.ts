import type { onote } from '../electron/src/preload/main/onote';

interface globalThis {
  onote: typeof onote;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

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
