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

declare module 'monaco-editor-nls/locale/zh-hans';

declare module 'relative';

declare module 'monaco-editor/esm/vs/base/common/uri';
