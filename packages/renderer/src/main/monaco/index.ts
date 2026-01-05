import * as monaco from 'monaco-editor';
import './language';
import './worker';
import './commands';
import './completions';
export * from './editor';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('Monaco');

logger.debug('Monaco editor loaded');
(window as any).monaco = monaco;
