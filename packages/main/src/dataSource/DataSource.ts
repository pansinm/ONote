import EventEmitter from 'events';
import { dataSourceProviderManager } from './providers';
import type { IDataSourceProvider } from './providers/IDataSourceProvider';
import { EventNames } from './constants';

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
    return this.provider.mkdir(uri);
  }

  async write(uri: string, data: Buffer) {
    await this.provider.write(uri, data);
    this.emit(EventNames.FileContentChanged, uri);
  }

  async writeText(uri: string, text: string) {
    await this.provider.write(uri, Buffer.from(text, 'utf-8'));
    this.emit(EventNames.FileContentChanged, uri);
  }

  readText(uri: string) {
    return this.provider.read(uri).then((buffer) => buffer.toString('utf-8'));
  }

  delete(uri: string) {
    return this.provider.delete(uri);
  }

  version(uri: string) {
    return this.provider.version(uri);
  }

  getTreeNode(uri: string) {
    return this.provider.getTreeNode(uri);
  }
  rename(uri: string, name: string) {
    return this.provider.rename(uri, name);
  }
  move(sourceUri: string, targetDirUri: string) {
    return this.provider.move(sourceUri, targetDirUri);
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
