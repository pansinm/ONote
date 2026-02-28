import { makeAutoObservable, runInAction } from 'mobx';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('AgentConversationStore');

export interface AgentConversation {
  id: string;
  projectId: string;
  userInput: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    steps?: unknown[];
  }>;
  createdAt: number;
  updatedAt: number;
}

export class AgentConversationStore {
  conversations: AgentConversation[] = [];
  currentProjectId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setProjectId(projectId: string) {
    runInAction(() => {
      this.currentProjectId = projectId;
    });
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
        projectId: conversation.projectId || this.currentProjectId || 'default',
        createdAt: now,
        updatedAt: now,
      };

      const projectUri = this.currentProjectId || 'file:///default';
      const conversationDir = `${projectUri}/.onote/agent`;
      
      await onote.dataSource.invoke('mkdir', conversationDir);
      
      const filePath = `${conversationDir}/${id}.json`;
      const content = JSON.stringify(fullConversation, null, 2);
      await onote.dataSource.invoke('writeText', filePath, content);

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
      
      const projectUri = this.currentProjectId || 'file:///default';
      const filePath = `${projectUri}/.onote/agent/${conversationId}.json`;
      
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

      const projectUri = this.currentProjectId || 'file:///default';
      const conversationDir = `${projectUri}/.onote/agent`;

      try {
        const files = await onote.dataSource.invoke('list', conversationDir);
        const conversations: AgentConversation[] = [];

        for (const file of files) {
          if (file.name.endsWith('.json')) {
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

      const projectUri = this.currentProjectId || 'file:///default';
      const filePath = `${projectUri}/.onote/agent/${conversationId}.json`;

      await onote.dataSource.invoke('delete', filePath);

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
      this.currentProjectId = null;
      this.error = null;
    });
  }
}
