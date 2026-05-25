/// <reference types="react" />

import type { Uri } from 'monaco-editor';

declare global {
  interface SimmerApi {
    localIpV4(): Promise<string | undefined>;
    invokeIpc(channel: string, ...args: unknown[]): Promise<unknown>;
    showPreviewerWindow(): void;
    renderGraphviz(dot: string, engine: string): Promise<string>;
    openDirectory(): Promise<Electron.OpenDialogReturnValue>;
    readBlobsFromClipboard(): Promise<Blob[]>;
    readFilePathsFromClipboard(): string[];
    readImageFromClipboard(): Promise<Blob | false>;
    renderPlantUML(plantuml: string, endpoint: string, useCache?: boolean): Promise<string[]>;
    openPath(uri: string): Promise<string>;
    copyImage(content: string | ArrayBuffer, type: 'dataURL' | 'ArrayBuffer'): Promise<void>;
    openExternal(uri: string): Promise<void>;
  }

  interface Window {
    onote: any;
    simmer: SimmerApi;
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

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'plantuml-encoder';

declare module '@editorjs/table';

declare module 'mdast' {
  export type Footnote = any;
}

export {};
