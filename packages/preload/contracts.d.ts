/* eslint-disable @typescript-eslint/consistent-type-imports */

interface Exposed {
  readonly nodeCrypto: Readonly<
    typeof import('./src/common/nodeCrypto').nodeCrypto
  >;
  readonly versions: Readonly<typeof import('./src/main/versions').versions>;
  readonly simmer: Readonly<typeof import('./src/main/simmer').simmer>;
  readonly onote: {
    dataSource: import('./src/ipc/IPCClient').default<
      import('../main/src/ipc-server/handlers/DataSourceHandler').default
    >;
    setting: import('./src/ipc/IPCClient').default<
      import('../main/src/ipc-server/handlers/SettingHandler').default
    >;
    pluginManager: import('./src/ipc/IPCClient').default<
      import('../main/src/ipc-server/handlers/PluginManagerHandler').default
    >;
    developTools: import('./src/ipc/IPCClient').default<
      import('../main/src/ipc-server/handlers/DevelopToolsHandler').default
    >;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Window extends Exposed {}

declare module 'monaco-editor/esm/vs/editor/common/*';

declare module 'monaco-vim';
