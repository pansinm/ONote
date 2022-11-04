import type DataSourceManager from './DataSourceManager';
import type { IDataSourceProvider } from './providers';

class DataSource {
  private provider!: IDataSourceProvider<any>;

  private cfg: Record<string, any>;
  private manager: DataSourceManager;

  private id: string;

  constructor(
    id: string,
    cfg: Record<string, any>,
    manager: DataSourceManager,
  ) {
    this.id = id;
    this.cfg = cfg;
    this.manager = manager;
  }

  getId() {
    return this.id;
  }

  setCurrent() {
    this.manager.setCurrentDataSource(this.id);
  }

  setProvider<T>(provider: IDataSourceProvider<T>) {
    this.provider = provider;
  }

  authenticate(form: any) {
    return this.provider.authenticate(form);
  }

  disconnect() {
    return this.provider.disconnect();
  }

  getAuthenticateSchema() {
    return this.provider.authenticateFormSchema;
  }

  getConfig() {
    return this.cfg;
  }

  //------------ content -------------//
  read(uri: string) {
    return this.provider.read(uri);
  }
  mkdir(uri: string) {
    return this.provider.mkdir(uri);
  }
  write(uri: string, data: Buffer) {
    return this.provider.write(uri, data);
  }

  writeText(uri: string, text: string) {
    return this.provider.write(uri, Buffer.from(text, 'utf-8'));
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
