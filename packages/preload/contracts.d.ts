/* eslint-disable @typescript-eslint/consistent-type-imports */

interface Exposed {
  readonly nodeCrypto: Readonly<
    typeof import('./src/main/nodeCrypto').nodeCrypto
  >;
  readonly versions: Readonly<typeof import('./src/main/versions').versions>;
  readonly simmer: Readonly<typeof import('./src/main/simmer').simmer>;
  readonly fileService: Readonly<
    typeof import('./src/main/fileService').fileService
  >;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Window extends Exposed {}

declare module 'monaco-editor/esm/vs/editor/common/*';
