import useConfirm from './useConfirm';
import usePrompt from './usePrompt';
import React, { useCallback, useMemo } from 'react';
import stores from '../main/stores';

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
      return;
    }
    if (type === 'file' && !name.includes('.')) {
      name = name + '.md';
    }
    return await window.fileService.create(dirUri, {
      type: type,
      uri: dirUri + '/' + encodeURIComponent(name),
    });
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
      await window.fileService.remove(uri);
      type === 'directory'
        ? stores.activationStore.closeFilesInDir(uri)
        : stores.activationStore.closeFile(uri);
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
      const newNode = await window.fileService.rename(uri, newName);
      type === 'directory'
        ? stores.activationStore.renameDirUri(uri, newNode.uri)
        : stores.activationStore.renameFileUri(uri, newNode.uri);
    }
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
