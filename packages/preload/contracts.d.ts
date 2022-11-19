/* eslint-disable @typescript-eslint/consistent-type-imports */

interface Exposed {
  readonly nodeCrypto: Readonly<
    typeof import('./src/common/nodeCrypto').nodeCrypto
  >;
  readonly versions: Readonly<typeof import('./src/main/versions').versions>;
  readonly simmer: Readonly<typeof import('./src/main/simmer').simmer>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Window extends Exposed {}

declare module 'monaco-editor/esm/vs/editor/common/*';

declare module 'monaco-vim';
