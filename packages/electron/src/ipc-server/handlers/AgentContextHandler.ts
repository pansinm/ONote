import path from 'node:path';
import fs from 'fs/promises';
import crypto from 'node:crypto';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';
import IpcHandler from '../IpcHandler';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('AgentContextHandler');

interface LoadAgentContextParams {
  fileUri: string;
  rootUri: string;
}

interface SaveAgentContextParams {
  fileUri: string;
  rootUri: string;
  context: {
    version: number;
    savedAt: number;
    fileUri: string;
    messages: Array<{ role: string; content: string }>;
  };
}

interface LoadExecutionStateParams {
  fileUri: string;
  rootUri: string;
}

interface SaveExecutionStateParams {
  fileUri: string;
  rootUri: string;
  state: {
    version: number;
    savedAt: number;
    fileUri: string;
    prompt: string;
    startTime: number;
    iteration: number;
    agentState: 'idle' | 'thinking' | 'executing';
    todos: any[];
    steps: any[];
  };
}

interface DeleteExecutionStateParams {
  fileUri: string;
  rootUri: string;
}

class AgentContextHandler extends IpcHandler {
  private getBaseDir(rootUri: string): string {
    const rootPath = uriToPath(rootUri);
    return path.join(rootPath, '.onote', 'data');
  }

  private getFilePath(fileUri: string, rootUri: string): string {
    const filePath = uriToPath(fileUri);
    const relativePath = path.relative(uriToPath(rootUri), filePath);
    const hash = crypto.createHash('md5').update(relativePath).digest('hex');
    const baseDir = this.getBaseDir(rootUri);
    return path.join(baseDir, hash, 'ai', 'agent.json');
  }

  async loadAgentContext(params: LoadAgentContextParams): Promise<{ version: number; savedAt: number; fileUri: string; messages: Array<{ role: string; content: string }> } | null> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      logger.debug('Loading agent context from', { fileUri, rootUri, filePath });

      const content = await fs.readFile(filePath, 'utf-8');
      const context = JSON.parse(content);

      logger.info('Agent context loaded successfully', {
        fileUri,
        rootUri,
        filePath,
        messageCount: context.messages?.length || 0,
      });

      return context;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Agent context file not found', { fileUri, rootUri });
        return null;
      }
      logger.error('Failed to load agent context', error, { fileUri, rootUri });
      throw error;
    }
  }

  async saveAgentContext(params: SaveAgentContextParams): Promise<void> {
    const { fileUri, rootUri, context } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      const dir = path.dirname(filePath);

      logger.debug('Saving agent context', {
        fileUri,
        rootUri,
        filePath,
        dir,
        messageCount: context.messages?.length || 0,
      });

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(context, null, 2), 'utf-8');

      logger.info('Agent context saved successfully', {
        fileUri,
        rootUri,
        filePath,
        messageCount: context.messages?.length || 0,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error, { fileUri, rootUri });
      throw error;
    }
  }

  async deleteAgentContext(params: { fileUri: string; rootUri: string }): Promise<void> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);

      logger.debug('Deleting agent context', { fileUri, rootUri, filePath });

      await fs.unlink(filePath);

      logger.info('Agent context deleted successfully', { fileUri, rootUri });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Agent context file not found', { fileUri, rootUri });
        return;
      }
      logger.error('Failed to delete agent context', error, { fileUri, rootUri });
      throw error;
    }
  }

  private getExecutionStateFilePath(fileUri: string, rootUri: string): string {
    const filePath = uriToPath(fileUri);
    const relativePath = path.relative(uriToPath(rootUri), filePath);
    const hash = crypto.createHash('md5').update(relativePath).digest('hex');
    const baseDir = this.getBaseDir(rootUri);
    return path.join(baseDir, hash, 'ai', 'execution-state.json');
  }

  async loadExecutionState(params: LoadExecutionStateParams): Promise<any | null> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getExecutionStateFilePath(fileUri, rootUri);
      logger.debug('Loading execution state from', { fileUri, rootUri, filePath });

      const content = await fs.readFile(filePath, 'utf-8');
      const state = JSON.parse(content);

      logger.info('Execution state loaded successfully', {
        fileUri,
        rootUri,
        filePath,
        iteration: state.iteration,
      });

      return state;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Execution state file not found', { fileUri, rootUri });
        return null;
      }
      logger.error('Failed to load execution state', error, { fileUri, rootUri });
      throw error;
    }
  }

  async saveExecutionState(params: SaveExecutionStateParams): Promise<void> {
    const { fileUri, rootUri, state } = params;
    try {
      const filePath = this.getExecutionStateFilePath(fileUri, rootUri);
      const dir = path.dirname(filePath);

      logger.debug('Saving execution state', {
        fileUri,
        rootUri,
        filePath,
        dir,
        iteration: state.iteration,
      });

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');

      logger.info('Execution state saved successfully', {
        fileUri,
        rootUri,
        filePath,
        iteration: state.iteration,
      });
    } catch (error) {
      logger.error('Failed to save execution state', error, { fileUri, rootUri });
      throw error;
    }
  }

  async deleteExecutionState(params: DeleteExecutionStateParams): Promise<void> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getExecutionStateFilePath(fileUri, rootUri);

      logger.debug('Deleting execution state', { fileUri, rootUri, filePath });

      await fs.unlink(filePath);

      logger.info('Execution state deleted successfully', { fileUri, rootUri });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Execution state file not found', { fileUri, rootUri });
        return;
      }
      logger.error('Failed to delete execution state', error, { fileUri, rootUri });
      throw error;
    }
  }
}

export default AgentContextHandler;
