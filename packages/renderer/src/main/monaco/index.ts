import * as monaco from 'monaco-editor';
import './language';
import './worker';
import './commands';
import './completions';
import { registerMonacoThemes } from './theme';
export * from './editor';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('Monaco');

// 注册墨与纸自定义主题（必须在创建 editor 实例之前）
registerMonacoThemes();

logger.debug('Monaco editor loaded');
(window as any).monaco = monaco;
