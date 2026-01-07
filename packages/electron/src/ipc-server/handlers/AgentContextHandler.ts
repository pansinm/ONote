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
  context: any;
}

interface AgentContext {
  fileUri: string;
  executionLog: any[];
  conversationHistory: any[];
  error: string | null;
  content: string;
  selection: string;
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

  async loadAgentContext(params: LoadAgentContextParams): Promise<AgentContext | null> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      logger.debug('Loading agent context from', { fileUri, rootUri, filePath });

      const content = await fs.readFile(filePath, 'utf-8');
      const context = JSON.parse(content) as AgentContext;

      logger.info('Agent context loaded successfully', {
        fileUri,
        rootUri,
        filePath,
        stepCount: context.executionLog?.length || 0,
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
        stepCount: context.executionLog?.length || 0,
      });

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(context, null, 2), 'utf-8');

      logger.info('Agent context saved successfully', {
        fileUri,
        rootUri,
        filePath,
        stepCount: context.executionLog?.length || 0,
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
}

export default AgentContextHandler;
