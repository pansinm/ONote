import React, { useEffect, useRef } from 'react';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';
import { LLM_BOX_MESSAGE_TYPES } from './constants';
import fileService from '../../services/fileService';
import * as monaco from 'monaco-editor';

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log(
      '[LLMBoxFrame] useEffect triggered, ref.current:',
      ref.current,
      'sidebarUrl:',
      stores.layoutStore.sidebarUrl,
    );

    if (!ref.current?.contentWindow) {
      console.log('[LLMBoxFrame] contentWindow not ready, waiting...');
      return;
    }

    console.log('[LLMBoxFrame] contentWindow ready, creating channel');
    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

    const contentChanged = subscription.subscribe(
      EDITOR_CONTENT_CHANGED,
      (data) => {
        send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED,
          data,
        });
      },
    );

    const selectionChanged = subscription.subscribe(
      EDITOR_SELECTION_CHANGED,
      (data) => {
        send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED,
          data,
        });
      },
    );

    const activeFileDisposer = reaction(
      () => stores.activationStore.activeFileUri,
      (uri) => {
        console.log('[LLMBoxFrame] Active file changed:', uri);
        if (uri) {
          send({
            type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
            data: { uri },
          });
          console.log('[LLMBoxFrame] Sent EDITOR_FILE_OPEN:', uri);
        }
      },
    );

    receive(async ({ type, data }: any) => {
      console.log('[LLMBoxFrame] Received message:', { type, data });

      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        const { fileUri, rootUri } = {
          fileUri: stores.activationStore.activeFileUri,
          rootUri: stores.activationStore.rootUri,
        };
        console.log('[LLMBoxFrame] Handling GET_CURRENT_FILE_INFO:', {
          fileUri,
          rootUri,
        });
        return { fileUri, rootUri };
      }

      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD) {
        const { fileUri } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLMBoxFrame] Handling LLM_CONVERSATION_LOAD:', {
          fileUri,
          rootUri,
        });

        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log(
            '[LLMBoxFrame] window.onote.llmConversation available:',
            !!onote?.llmConversation,
          );

          if (!onote?.llmConversation) {
            throw new Error('llmConversation not available');
          }

          const messages = await onote.llmConversation.invoke(
            'loadConversation',
            {
              fileUri,
              rootUri,
            },
          );
          console.log('[LLMBoxFrame] Loaded messages:', messages?.length);
          return { messages };
        } catch (error) {
          console.error('[LLMBoxFrame] Failed to load conversation:', error);
          return {
            error: error instanceof Error ? error.message : '加载对话历史失败',
          };
        }
      }

      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE) {
        const { fileUri, messages } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLBoxFrame] Handling LLM_CONVERSATION_SAVE:', {
          fileUri,
          rootUri,
          messageCount: messages?.length,
        });

        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log(
            '[LLMBoxFrame] window.onote.llmConversation available:',
            !!onote?.llmConversation,
          );

          if (!onote?.llmConversation) {
            throw new Error('llmConversation not available');
          }

          await onote.llmConversation.invoke('saveConversation', {
            fileUri,
            messages,
            rootUri,
          });
          console.log('[LLMBoxFrame] Saved conversation successfully');
          return { success: true };
        } catch (error) {
          console.error('[MBoxFrame] Failed to save conversation:', error);
          return {
            error: error instanceof Error ? error.message : '保存对话历史失败',
          };
        }
      }

      // === 新增：Agent 文件操作处理 ===

      // 获取根 URI
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_GET_ROOT_URI) {
        return { rootUri: stores.activationStore.rootUri };
      }

      // 获取当前文件 URI
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_GET_ACTIVE_FILE_URI) {
        return { fileUri: stores.activationStore.activeFileUri };
      }

      // 读取文件（使用 fileStore 以支持编辑器同步）
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ) {
        try {
          const { uri } = data;
          const model = await stores.fileStore.getOrCreateModel(uri);
          const content = model.getValue();
          return { content };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : 'Failed to read file',
          };
        }
      }

      // 写入文件（使用 fileStore 以同步到编辑器）
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE) {
        try {
          const { uri, content } = data;
          const model = await stores.fileStore.getOrCreateModel(uri);
          model.setValue(content);
          await stores.fileStore.saveFile(uri, content);
          return { success: true };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : 'Failed to write file',
          };
        }
      }

      // 创建文件（使用 fileStore 以同步到编辑器）
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_CREATE) {
        try {
          const { uri, content } = data;
          await stores.fileStore.saveFile(uri, content || '');
          return { success: true };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : 'Failed to create file',
          };
        }
      }

      // 删除文件
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_DELETE) {
        try {
          const { uri } = data;
          await stores.fileStore.closeFile(uri);
          await fileService.remove(uri);
          return { success: true };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : 'Failed to delete file',
          };
        }
      }

      // 列出目录
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_LIST) {
        try {
          let { uri } = data;
          const treeNode = await fileService.getTreeNode(uri);
          if (treeNode.type === 'file') {
            throw new Error('Cannot list files in a file');
          }
          const treeNodes = await fileService.listDir(uri);
          const files = treeNodes.map((node: any) => ({
            name: node.name,
            uri: node.uri,
            isDirectory: node.isDirectory,
          }));
          return { files };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to list directory',
          };
        }
      }

      // 搜索文件
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH) {
        try {
          const { rootUri, keywords } = data;
          const treeNodes = await fileService.searchFiles(rootUri, keywords);
          const results = treeNodes.map((node: any) => ({
            name: node.name,
            uri: node.uri,
            isDirectory: node.isDirectory,
          }));
          return { results };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : 'Failed to search files',
          };
        }
      }

      // 文件内搜索
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH_IN) {
        try {
          const { uri, pattern } = data;
          const content = await fileService.readText(uri);

          const regex = new RegExp(pattern, 'gi');
          const matches: Array<{ line: number; text: string }> = [];

          const lines = content.split('\n');
          lines.forEach((line: string, index: number) => {
            if (regex.test(line)) {
              matches.push({ line: index + 1, text: line.trim() });
            }
          });

          return { matches, count: matches.length };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to search in file',
          };
        }
      }

      // === Agent 上下文处理 ===

      // 加载 Agent 上下文
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_LOAD) {
        const { fileUri } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLMBoxFrame] Handling AGENT_CONTEXT_LOAD:', {
          fileUri,
          rootUri,
        });

        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log(
            '[LLMBoxFrame] window.onote.agentContext available:',
            !!onote?.agentContext,
          );

          if (!onote?.agentContext) {
            throw new Error('agentContext not available');
          }

          const context = await onote.agentContext.invoke('loadAgentContext', {
            fileUri,
            rootUri,
          });
          console.log('[LLMBoxFrame] Loaded agent context:', context);
          return { context };
        } catch (error) {
          console.error('[LLMBoxFrame] Failed to load agent context:', error);
          return {
            error:
              error instanceof Error ? error.message : '加载Agent上下文失败',
          };
        }
      }

      // 保存 Agent 上下文
      if (type === LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_SAVE) {
        const { fileUri, context } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLMBoxFrame] Handling AGENT_CONTEXT_SAVE:', {
          fileUri,
          rootUri,
          stepCount: context?.executionLog?.length || 0,
        });

        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log(
            '[LLMBoxFrame] window.onote.agentContext available:',
            !!onote?.agentContext,
          );

          if (!onote?.agentContext) {
            throw new Error('agentContext not available');
          }

          await onote.agentContext.invoke('saveAgentContext', {
            fileUri,
            rootUri,
            context,
          });
          console.log('[LLMBoxFrame] Saved agent context successfully');
          return { success: true };
        } catch (error) {
          console.error('[LLMBoxFrame] Failed to save agent context:', error);
          return {
            error:
              error instanceof Error ? error.message : '保存Agent上下文失败',
          };
        }
      }

      return undefined;
    });

    return () => {
      console.log('[LLMBoxFrame] Cleaning up');
      contentChanged.dispose();
      selectionChanged.dispose();
      activeFileDisposer();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="LLMBox"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
      }}
      src={stores.layoutStore.sidebarUrl}
    />
  );
}

export default LLMBoxFrame;
