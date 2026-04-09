import { makeAutoObservable, runInAction } from 'mobx';
import { getLogger } from '/@/shared/logger';
import type { ConversationStep } from '/@/main/types/IMessage';

const logger = getLogger('AgentConversationStore');

export interface AgentConversation {
  id: string;
  projectId?: string;
  userInput: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    steps?: ConversationStep[];
  }>;
  createdAt: number;
  updatedAt: number;
}

export class AgentConversationStore {
  conversations: AgentConversation[] = [];
  rootUri: string | null = null;
  fileUri: string | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setContext(rootUri: string, fileUri: string | null) {
    runInAction(() => {
      this.rootUri = rootUri;
      this.fileUri = fileUri;
    });
  }

  /**
   * 将相对路径转换为可读目录名
   * notes/project-a/readme.md → notes__project-a__readme.md
   */
  private pathToDirname(relativePath: string): string {
    // 替换斜杠为双下划线，移除不安全字符
    return relativePath
      .replace(/\//g, '__')
      .replace(/[<>:"\\|?*\x00-\x1f]/g, '_')
      .slice(0, 200); // 防止超长路径
  }

  private async getConversationDir(): Promise<string> {
    if (!this.rootUri || !this.fileUri) {
      return `${this.rootUri || 'file:///default'}/.onote/default`;
    }

    const filePath = decodeURIComponent(new URL(this.fileUri).pathname);
    const rootPath = decodeURIComponent(new URL(this.rootUri).pathname);
    const relativePath = filePath.replace(rootPath, '').replace(/^\//, '');

    if (!relativePath) {
      return `${this.rootUri}/.onote/default`;
    }

    return `${this.rootUri}/.onote/${this.pathToDirname(relativePath)}`;
  }

  async saveConversation(conversation: Omit<AgentConversation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    try {
      this.loading = true;
      const onote = (window as any).onote;

      const id = conversation.id || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const now = Date.now();

      const fullConversation: AgentConversation = {
        ...conversation,
        id,
        projectId: this.rootUri || 'default',
        createdAt: now,
        updatedAt: now,
      };

      const conversationDir = await this.getConversationDir();
      await onote.dataSource.invoke('mkdir', conversationDir);

      const filePath = `${conversationDir}/${id}.json`;
      const content = JSON.stringify(fullConversation, null, 2);
      await onote.dataSource.invoke('writeText', filePath, content);

      // 更新 index 文件（轻量元数据，用于快速列表）
      try {
        let index: Array<{ id: string; userInput: string; createdAt: number; updatedAt: number }> = [];
        try {
          const indexContent = await onote.dataSource.invoke('readText', `${conversationDir}/_index.json`);
          index = JSON.parse(indexContent);
        } catch {
          // index 不存在，正常
        }
        const existingIdx = index.findIndex((e) => e.id === id);
        const entry = { id, userInput: conversation.userInput, createdAt: now, updatedAt: now };
        if (existingIdx >= 0) {
          index[existingIdx] = entry;
        } else {
          index.push(entry);
        }
        await onote.dataSource.invoke('writeText', `${conversationDir}/_index.json`, JSON.stringify(index, null, 2));
      } catch (e) {
        logger.warn('Failed to update index', e);
      }

      runInAction(() => {
        this.conversations.push(fullConversation);
      });

      logger.debug('Conversation saved', { conversationId: id });
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to save conversation', error);
      runInAction(() => {
        this.error = errorMessage;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadConversation(conversationId: string): Promise<AgentConversation | null> {
    try {
      this.loading = true;
      const onote = (window as any).onote;

      const conversationDir = await this.getConversationDir();
      const filePath = `${conversationDir}/${conversationId}.json`;

      const content = await onote.dataSource.invoke('readText', filePath);
      const conversation: AgentConversation = JSON.parse(content);
      
      runInAction(() => {
        const existingIndex = this.conversations.findIndex(c => c.id === conversationId);
        if (existingIndex >= 0) {
          this.conversations[existingIndex] = conversation;
        } else {
          this.conversations.push(conversation);
        }
      });

      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to load conversation', error, { conversationId });
      runInAction(() => {
        this.error = errorMessage;
      });
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async listConversations(): Promise<AgentConversation[]> {
    try {
      this.loading = true;
      const onote = (window as any).onote;

      const conversationDir = await this.getConversationDir();

      try {
        const files = await onote.dataSource.invoke('list', conversationDir);

        // 优先读 index 文件（只含元数据，不需要读每个全文）
        const indexFile = files.find((f: any) => f.name === '_index.json');
        if (indexFile) {
          try {
            const indexContent = await onote.dataSource.invoke('readText', `${conversationDir}/_index.json`);
            const index = JSON.parse(indexContent) as Array<{
              id: string;
              userInput: string;
              updatedAt: number;
              createdAt: number;
            }>;
            // 只读 index，返回轻量摘要
            const conversations = index.map((item) => ({
              id: item.id,
              projectId: this.rootUri || 'default',
              userInput: item.userInput,
              messages: [],
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }));
            runInAction(() => {
              this.conversations = conversations.sort((a, b) => b.updatedAt - a.updatedAt);
            });
            return conversations;
          } catch {
            // index 损坏则 fallback 到逐文件读取
          }
        }

        // fallback：逐文件读取（无 index 时）
        const conversations: AgentConversation[] = [];

        for (const file of files) {
          if (file.name.endsWith('.json') && file.name !== '_index.json') {
            const conversationId = file.name.replace('.json', '');
            const conversation = await this.loadConversation(conversationId);
            if (conversation) {
              conversations.push(conversation);
            }
          }
        }

        runInAction(() => {
          this.conversations = conversations.sort((a, b) => b.updatedAt - a.updatedAt);
        });

        return conversations;
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          runInAction(() => {
            this.conversations = [];
          });
          return [];
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to list conversations', error);
      runInAction(() => {
        this.error = errorMessage;
      });
      return [];
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      this.loading = true;
      const onote = (window as any).onote;

      const conversationDir = await this.getConversationDir();
      const filePath = `${conversationDir}/${conversationId}.json`;

      await onote.dataSource.invoke('delete', filePath);

      // 从 index 中移除
      try {
        const indexContent = await onote.dataSource.invoke('readText', `${conversationDir}/_index.json`);
        const index: Array<{ id: string }> = JSON.parse(indexContent);
        const newIndex = index.filter((e) => e.id !== conversationId);
        await onote.dataSource.invoke('writeText', `${conversationDir}/_index.json`, JSON.stringify(newIndex, null, 2));
      } catch {
        // index 不存在则忽略
      }

      runInAction(() => {
        this.conversations = this.conversations.filter((c) => c.id !== conversationId);
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to delete conversation', error, { conversationId });
      runInAction(() => {
        this.error = errorMessage;
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  clear() {
    runInAction(() => {
      this.conversations = [];
      this.rootUri = null;
      this.fileUri = null;
      this.error = null;
    });
  }
}
