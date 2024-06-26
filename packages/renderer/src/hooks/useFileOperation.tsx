import useConfirm from './useConfirm';
import usePrompt from './usePrompt';
import React, { useCallback } from 'react';
import stores from '../main/stores';
import { alertAndThrow } from '../common/utils/alert';
import fileService from '/@/main/services/fileService';
import { resolveUri } from '../common/utils/uri';

function useFileOperation() {
  const { open: openPrompt, Prompt } = usePrompt();
  const { open: openConfirm, Confirm } = useConfirm();

  const createFile = async (dirUri: string, type: 'directory' | 'file') => {
    let name = await openPrompt({
      title: '创建笔记',
      defaultValue: '',
      description: '请输入笔记名称:',
    });
    if (!name) {
      throw new Error('cancel create');
    }
    if (type === 'file' && !name.includes('.')) {
      name = name + '.md';
    }

    const template = await fileService
      .readText(resolveUri(dirUri + '/', 'template.md'))
      .catch(() => '');

    const fileUri = resolveUri(dirUri + '/', name);
    const node = await fileService
      .create(dirUri, {
        type: type,
        uri: fileUri,
      })
      .catch(alertAndThrow);
    await fileService.writeText(fileUri, template);
    if (type === 'file') {
      await stores.fileListStore.refreshFiles();
      stores.activationStore.activeFile(node.uri);
    }
    return node;
  };

  const deleteFile = async (uri: string, type: 'directory' | 'file') => {
    const tips = (
      <>
        是否删除{type === 'directory' ? '目录及子目录' : '文件'}
        <span style={{ color: 'red' }}>
          {decodeURIComponent(uri.split('/').pop()!)}
        </span>
      </>
    );
    if (
      await openConfirm({
        title: '删除',
        content: tips,
        shouldCloseOnEsc: true,
      })
    ) {
      await fileService.remove(uri).catch(alertAndThrow);
      if (type === 'directory') {
        stores.activationStore.closeFilesInDir(uri);
      } else {
        stores.activationStore.closeFile(uri);
        await stores.fileListStore.refreshFiles();
      }
    } else {
      throw new Error('not delete');
    }
  };

  const renameFile = async (uri: string, type: 'directory' | 'file') => {
    const title = decodeURIComponent(uri.split('/').pop()!);
    const newName = await openPrompt({
      title: '重命名',
      defaultValue: title,
      description: '请输入名称',
    });
    if (newName) {
      const newNode = await fileService
        .rename(uri, newName)
        .catch(alertAndThrow);
      if (type === 'directory') {
        stores.activationStore.renameDirUri(uri, newNode.uri);
      } else {
        stores.activationStore.renameFileUri(uri, newNode.uri);
        await stores.fileListStore.refreshFiles();
      }
      return newNode;
    }
    throw new Error('not rename');
  };

  const Modal = useCallback(
    () => (
      <>
        <Prompt />
        <Confirm />
      </>
    ),
    [Prompt, Confirm],
  );

  return {
    createFile,
    renameFile,
    deleteFile,
    Modal,
  };
}

export default useFileOperation;
