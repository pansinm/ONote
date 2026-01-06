import { webContents } from 'electron';
import { IPCNamespaces } from '../constants';
import { EventNames } from '../constants';
import IPCServer from './IPCServer';
import DataSourceHandler from './handlers/DataSourceHandler';
import { delegateEvent } from './utils';
import { getMainFrame } from '../window';
import { dataSource } from '../dataSource';
import SettingHandler from './handlers/SettingHandler';
import setting from '../setting';
import DevelopToolsHandler from './handlers/DevelopToolsHandler';
import PluginManagerHandler from './handlers/PluginManagerHandler';
import CronHandler from './handlers/CronHandler';
import TypstHandler from './handlers/TypstHandler';
import LLMConversationHandler from './handlers/LLMConversationHandler';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('IPCServer');

/**
 * 处理渲染进程事件
 */
const ipcServer = new IPCServer();

function startDataSource() {
  ipcServer.register(IPCNamespaces.DataSource, DataSourceHandler);
  delegateEvent(
    dataSource,
    EventNames.FileContentChanged,
    IPCNamespaces.DataSource,
    () => webContents.fromFrame(getMainFrame()!)!,
  );
}

function startSetting() {
  ipcServer.register(IPCNamespaces.Setting, SettingHandler);
  delegateEvent(
    setting,
    EventNames.SettingUpdated,
    IPCNamespaces.Setting,
    () => webContents.fromFrame(getMainFrame()!)!,
  );
}

export function startIpcServer() {
  logger.info('Starting IPC server');
  startDataSource();
  startSetting();
  ipcServer.register(IPCNamespaces.DevelopTools, DevelopToolsHandler);
  ipcServer.register(IPCNamespaces.PluginManager, PluginManagerHandler);
  ipcServer.register(IPCNamespaces.Cron, CronHandler);
  ipcServer.register(IPCNamespaces.Typst, TypstHandler);
  ipcServer.register(IPCNamespaces.LLMConversation, LLMConversationHandler);
  logger.info('IPC server started');
}
