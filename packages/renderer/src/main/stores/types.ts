import type ActivationStore from './ActivationStore';
import type FileStateStore from './FileStore';
import type SettingStore from './SettingStore';
import type LayoutStore from './LayoutStore';
import type TodoStore from './TodoStore';
import type FileListStore from './FileListStore';

export interface Stores {
  activationStore: ActivationStore;
  fileStore: FileStateStore;
  settingStore: SettingStore;
  layoutStore: LayoutStore;
  todoStore: TodoStore;
  fileListStore: FileListStore;
}

export type OnoteAPI = {
  dataSource: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
    addListener: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  };
  setting: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  pluginManager: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  cron: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  developTools: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  typst: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  llmConversation: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
  agentContext: {
    invoke: <T = unknown>(method: string, ...args: unknown[]) => Promise<T>;
  };
};
