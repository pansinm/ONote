import path from 'node:path';
import fs from 'fs/promises';
import crypto from 'node:crypto';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';
import IpcHandler from '../IpcHandler';
import { getLogger } from '/@/shared/logger';
import type { Message } from '/@/renderer/src/llmbox/types';

const logger = getLogger('LLMConversationHandler');

interface LoadConversationParams {
  fileUri: string;
  rootUri: string;
}

interface SaveConversationParams {
  fileUri: string;
  messages: Message[];
  rootUri: string;
}

class LLMConversationHandler extends IpcHandler {
  private getBaseDir(rootUri: string): string {
    const rootPath = uriToPath(rootUri);
    return path.join(rootPath, '.onote', 'data');
  }

  private getFilePath(fileUri: string, rootUri: string): string {
    const filePath = uriToPath(fileUri);
    const relativePath = path.relative(uriToPath(rootUri), filePath);
    const hash = crypto.createHash('md5').update(relativePath).digest('hex');
    const baseDir = this.getBaseDir(rootUri);
    return path.join(baseDir, hash, 'ai', 'conversation.json');
  }

  async loadConversation(params: LoadConversationParams): Promise<Message[] | null> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      logger.debug('Loading conversation from', { fileUri, rootUri, filePath });

      const content = await fs.readFile(filePath, 'utf-8');
      const messages = JSON.parse(content) as Message[];

      logger.info('Conversation loaded successfully', {
        fileUri,
        rootUri,
        filePath,
        messageCount: messages.length,
      });

      return messages;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Conversation file not found', { fileUri, rootUri });
        return null;
      }
      logger.error('Failed to load conversation', error, { fileUri, rootUri });
      throw error;
    }
  }

  async saveConversation(params: SaveConversationParams): Promise<void> {
    const { fileUri, messages, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      const dir = path.dirname(filePath);

      logger.debug('Saving conversation', {
        fileUri,
        rootUri,
        filePath,
        dir,
        messageCount: messages.length,
      });

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8');

      logger.info('Conversation saved successfully', {
        fileUri,
        rootUri,
        filePath,
        messageCount: messages.length,
      });
    } catch (error) {
      logger.error('Failed to save conversation', error, { fileUri, rootUri });
      throw error;
    }
  }

  async deleteConversation(params: { fileUri: string; rootUri: string }): Promise<void> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);

      logger.debug('Deleting conversation', { fileUri, rootUri, filePath });

      await fs.unlink(filePath);

      logger.info('Conversation deleted successfully', { fileUri, rootUri });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Conversation file not found', { fileUri, rootUri });
        return;
      }
      logger.error('Failed to delete conversation', error, { fileUri, rootUri });
      throw error;
    }
  }
}

export default LLMConversationHandler;
