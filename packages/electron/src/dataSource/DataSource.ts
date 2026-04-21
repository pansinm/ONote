import EventEmitter from 'events';
import * as url from 'url';
import * as path from 'path';
import { dataSourceProviderManager } from './providers';
import type { IDataSourceProvider } from './providers/IDataSourceProvider';
import { EventNames } from '../constants';

class DataSource extends EventEmitter implements IDataSourceProvider<unknown> {
  private provider!: IDataSourceProvider<any>;

  constructor(defaultProviderId: string) {
    super();
    this.setProvider(defaultProviderId);
  }

  getForm(): unknown {
    return this.provider.getForm();
  }

  setRootDirUri(rootDirUri: string) {
    return this.provider.setRootDirUri(rootDirUri);
  }

  getRootDirUri() {
    return this.provider.getRootDirUri();
  }

  providerId() {
    return this.provider.providerId();
  }

  setProvider(dataSourceId: string) {
    this.provider = dataSourceProviderManager.getProvider(
      dataSourceId,
    ) as IDataSourceProvider<unknown>;
  }

  connect(form: any) {
    return this.provider.connect(form);
  }

  disconnect() {
    return this.provider.disconnect();
  }

  //------------ content -------------//
  read(uri: string) {
    return this.provider.read(uri);
  }
  mkdir(uri: string) {
    return this.provider.mkdir(uri).then(() => {
      this.emit(EventNames.FileCreated, uri);
    });
  }

  async write(uri: string, data: Buffer) {
    await this.provider.write(uri, data);
    this.emit(EventNames.FileContentChanged, uri);
  }

  async writeText(uri: string, text: string) {
    await this.provider.write(uri, Buffer.from(text, 'utf-8'));
    this.emit(EventNames.FileContentChanged, uri);
  }

  /** 创建新文件（写入内容并触发 FILE_CREATED） */
  async createFile(uri: string, text: string) {
    await this.provider.write(uri, Buffer.from(text, 'utf-8'));
    this.emit(EventNames.FileContentChanged, uri);
    this.emit(EventNames.FileCreated, uri);
  }

  readText(uri: string) {
    return this.provider.read(uri).then((buffer) => buffer.toString('utf-8'));
  }

  delete(uri: string) {
    return this.provider.delete(uri).then(() => {
      this.emit(EventNames.FileDeleted, uri);
    });
  }

  version(uri: string) {
    return this.provider.version(uri);
  }

  getTreeNode(uri: string) {
    return this.provider.getTreeNode(uri);
  }
  rename(uri: string, name: string) {
    return this.provider.rename(uri, name).then((result) => {
      this.emit(EventNames.FileRenamed, uri, result.uri, result.type);
      if (result.type === 'directory') {
        this.emit(EventNames.FileDeleted, uri);
        this.emit(EventNames.FileCreated, result.uri);
      } else {
        this.emit(EventNames.FileContentChanged, result.uri);
      }
      return result;
    });
  }
  move(sourceUri: string, targetDirUri: string) {
    // 不能把目录移到自身或自身的子目录中
    const source = url.fileURLToPath(sourceUri);
    const target = url.fileURLToPath(targetDirUri);
    if (target === source || target.startsWith(source + path.sep)) {
      return Promise.reject(new Error('Cannot move a directory into itself or its subdirectory'));
    }
    return this.provider.move(sourceUri, targetDirUri).then((result) => {
      this.emit(EventNames.FileMoved, sourceUri, result.uri, result.type);
      if (result.type === 'directory') {
        this.emit(EventNames.FileDeleted, sourceUri);
        this.emit(EventNames.FileCreated, result.uri);
      } else {
        this.emit(EventNames.FileContentChanged, result.uri);
      }
      return result;
    });
  }
  listDir(uri: string) {
    return this.provider.listDir(uri);
  }
  search(rootUri: string, keywords: string) {
    return this.provider.search(rootUri, keywords);
  }
  cache(uri: string) {
    return this.provider.cache(uri);
  }
}

export default DataSource;
