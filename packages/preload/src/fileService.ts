import { ipcRenderer } from 'electron';
import type { TreeNode, FileService } from '@sinm/react-file-tree/lib/type';
import { exposeInMainWorld } from './exposeInMainWorld';
export const fileService = {
  read: function (uri: string) {
    return ipcRenderer.invoke('fileservice', 'read', uri);
  },
  readdir: function (uri: string) {
    return ipcRenderer.invoke('fileservice', 'readdir', uri);
  },
  move: function (fromUri: string, dirUri: string) {
    return ipcRenderer.invoke('fileservice', 'move', fromUri, dirUri);
  },
  rename: function (uri: string, name: string) {
    return ipcRenderer.invoke('fileservice', 'rename', uri, name);
  },
  create: function (uri: string, childNode: TreeNode) {
    return ipcRenderer.invoke('fileservice', 'create', uri, childNode);
  },
  remove: function (uri: string) {
    return ipcRenderer.invoke('fileservice', 'remove', uri);
  },
} as FileService;

exposeInMainWorld('fileService', fileService);
