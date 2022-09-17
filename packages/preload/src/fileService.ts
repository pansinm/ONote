import { ipcRenderer } from 'electron';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { exposeInMainWorld } from './exposeInMainWorld';
import type FileService from '../../main/src/fileservice/FileService';

export const fileService = {
  getService: () => {
    return ipcRenderer.invoke('fileservice', 'getService');
  },
  connect: (type, config) => {
    return ipcRenderer.invoke('fileservice', 'connect', type, config);
  },
  read: function (uri: string) {
    return ipcRenderer.invoke('fileservice', 'read', uri);
  },
  readText: (uri: string) => {
    return ipcRenderer.invoke('fileservice', 'readText', uri);
  },
  writeText: (uri: string, content: string) => {
    return ipcRenderer.invoke('fileservice', 'writeText', uri, content);
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
