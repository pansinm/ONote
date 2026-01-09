/// <reference types="react" />

import type { Uri } from 'monaco-editor';

declare global {
  interface Window {
    onote: any;
    simmer: any;
    nodeCrypto: {
      randomBytes: (size: number) => Buffer;
      encodeBase64: (data: string | Buffer) => string;
      decodeBase64: (data: string | Buffer) => string;
    };
  }
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
  export type Root = any;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'plantuml-encoder';

declare module '@editorjs/table';

declare module 'mdast' {
  export type Footnote = any;
}

export {};
