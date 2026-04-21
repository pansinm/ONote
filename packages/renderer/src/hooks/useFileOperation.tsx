import useConfirm from './useConfirm';
import usePrompt from './usePrompt';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import stores from '../main/stores';
import { alertAndThrow } from '../common/utils/alert';
import fileService from '/@/main/services/fileService';
import { resolveUri, basename } from '../common/utils/uri';
import Pop from '/@/utils/Pop';

function useFileOperation() {
  const { open: openPrompt, Prompt } = usePrompt();
  const { open: openConfirm, Confirm } = useConfirm();
  const { t } = useTranslation('menu');

  const createFile = async (dirUri: string, type: 'directory' | 'file') => {
    let name = await openPrompt({
      title: t('createNote'),
      defaultValue: '',
      description: t('inputNoteName'),
    });
    if (!name) {
      throw new Error('cancel create');
    }
    if (type === 'file' && !name.includes('.')) {
      name = name + '.md';
    }

    const fileUri = resolveUri(dirUri + '/', name);

    try {
      const existingFiles = await fileService.listDir(dirUri);
      const exists = existingFiles.some((file) => basename(file.uri) === name);
      if (exists) {
        Pop.showToast({
          message: type === 'directory' ? t('directoryExists', { name }) : t('fileExists', { name }),
          type: 'error',
        });
        throw new Error('File already exists');
      }
    } catch (error) {
      if ((error as Error).message === 'File already exists') {
        throw error;
      }
    }

    try {
      const node = await fileService.create(dirUri, {
        type: type,
        uri: fileUri,
      });

      if (type === 'file') {
        const template = await fileService
          .readText(resolveUri(dirUri + '/', 'template.md'))
          .catch(() => '');
        await fileService.writeText(fileUri, template);
        // 注意：不需要手动 refreshFiles — create 触发 FILE_CREATED 事件，
        // FileListStore 和 Directory 组件各自监听事件自动刷新
        stores.activationStore.activeFile(node.uri);
      }
      return node;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EEXIST') {
        Pop.showToast({
          message: type === 'directory' ? t('directoryExists', { name }) : t('fileExists', { name }),
          type: 'error',
        });
        throw new Error('File already exists');
      }
      throw error;
    }
  };

  const deleteFile = async (uri: string, type: 'directory' | 'file') => {
    const tips = (
      <>
        {t('confirmDelete', { type: type === 'directory' ? t('directoryAndSubdirs') : t('file') })}
        <span style={{ color: 'red' }}>
          {decodeURIComponent(uri.split('/').pop()!)}
        </span>
      </>
    );
    if (
      await openConfirm({
        title: t('deleteNote'),
        content: tips,
        shouldCloseOnEsc: true,
      })
    ) {
      await fileService.remove(uri).catch(alertAndThrow);
      if (type === 'directory') {
        stores.activationStore.closeFilesInDir(uri);
      } else {
        stores.activationStore.closeFile(uri);
        // FILE_DELETED 事件会自动触发 FileListStore 和 Directory 刷新
      }
    } else {
      throw new Error('not delete');
    }
  };

  const renameFile = async (uri: string, type: 'directory' | 'file') => {
    const title = decodeURIComponent(uri.split('/').pop()!);
    const newName = await openPrompt({
      title: t('renameNote'),
      defaultValue: title,
      description: t('inputName'),
    });
    if (newName) {
      const newNode = await fileService
        .rename(uri, newName)
        .catch(alertAndThrow);
      if (type === 'directory') {
        stores.activationStore.renameDirUri(uri, newNode.uri);
      } else {
        stores.activationStore.renameFileUri(uri, newNode.uri);
        // FILE_RENAMED 事件会自动触发 FileListStore 和 Directory 刷新
      }
      return newNode;
    }
    throw new Error('not rename');
  };

  const Modal = useCallback(
    () => {
      const Component = () => (
        <>
          <Prompt />
          <Confirm />
        </>
      );
      Component.displayName = 'Modal';
      return <Component />;
    },
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
