export interface Manifest {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
  author?: string;
}

export type Handlers = {
  [key: string]: (node: any, renderCtx: any) => React.ReactNode | symbol;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context {
  executeEdits: (operations: any[]) => void;
}

export type PluginFactory = (context: Context) => PluginInstance;

export interface PluginInstance {
  manifest?: Manifest;
  customHandlers?: (handlers: Handlers) => Handlers;
}
