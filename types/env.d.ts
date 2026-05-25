/// <reference types="node" />

/**
 * Describes all existing environment variables and their types.
 * Required for Code completion and type checking.
 *
 * Set by scripts/watch.js (Webpack dev server) for development mode.
 */
interface ImportMetaEnv {
  /**
   * The URL of the Webpack dev server, set in scripts/watch.js
   */
  readonly DEV_SERVER_URL: undefined | string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'plantuml-encoder';

declare module 'dotenv' {
  export interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
    override?: boolean;
  }

  export interface DotenvConfigOutput {
    parsed?: Record<string, string>;
    error?: Error;
  }

  export function config(options?: DotenvConfigOptions): DotenvConfigOutput;

  const dotenv: {
    config: typeof config;
  };

  export default dotenv;
}

declare module 'monaco-editor-nls/locale/zh-hans';

declare module 'relative';

declare module 'monaco-editor/esm/vs/base/common/uri';

declare namespace ReactModalCompat {
  interface Styles {
    content?: React.CSSProperties | undefined;
    overlay?: React.CSSProperties | undefined;
  }

  interface Classes {
    base: string;
    afterOpen: string;
    beforeClose: string;
  }

  interface Aria {
    labelledby?: string | undefined;
    describedby?: string | undefined;
    modal?: boolean | 'false' | 'true' | undefined;
  }

  interface Props {
    children?: React.ReactNode;
    isOpen: boolean;
    style?: Styles | undefined;
    className?: string | Classes | undefined;
    overlayClassName?: string | Classes | undefined;
    appElement?: HTMLElement | HTMLElement[] | HTMLCollection | NodeList | undefined;
    onRequestClose?(event: React.MouseEvent | React.KeyboardEvent): void;
    shouldCloseOnOverlayClick?: boolean | undefined;
    shouldCloseOnEsc?: boolean | undefined;
    aria?: Aria | undefined;
    contentLabel?: string | undefined;
    overlayElement?: ((props: React.ComponentPropsWithRef<'div'>, contentEl: React.ReactElement) => React.ReactElement) | undefined;
    contentElement?: ((props: React.ComponentPropsWithRef<'div'>, children: React.ReactNode) => React.ReactElement) | undefined;
  }
}

declare module 'react-modal' {
  const ReactModal: React.FC<ReactModalCompat.Props> & {
    defaultStyles: ReactModalCompat.Styles;
    setAppElement(appElement: string | HTMLElement): void;
  };

  export = ReactModal;
}

declare module '@sinm/react-file-tree' {
  export type TreeNodeType = 'directory' | 'file';
  export type TreeNode<T extends object = { name?: string; mtime?: number }, K extends keyof T = keyof T> = {
    [P in K]: T[P];
  } & {
    type: TreeNodeType;
    uri: string;
    expanded?: boolean;
    children?: TreeNode<T, K>[];
  };

  export const utils: typeof import('@sinm/react-file-tree/lib/utils');
  export const FileTree: typeof import('@sinm/react-file-tree/lib/FileTree').default;
  export type FileTreeProps = import('@sinm/react-file-tree/lib/FileTree').FileTreeProps;
}

declare module '@sinm/react-file-tree/lib/type' {
  export type TreeNodeType = 'directory' | 'file';
  export type TreeNode<T extends object = { name?: string; mtime?: number }, K extends keyof T = keyof T> = {
    [P in K]: T[P];
  } & {
    type: TreeNodeType;
    uri: string;
    expanded?: boolean;
    children?: TreeNode<T, K>[];
  };
}
