import PluginManager from './PluginManager';

export const manager = new PluginManager();

export { PluginManager };
manager.loadAll();
