import type {
  FileService as _FileService,
  TreeNode,
} from '@sinm/react-file-tree/lib/type';
import setting from '../setting';
import LocalFileService from './LocalFileService';
import SSHFileService from './SSHFileService';
import type { IFileService } from './types';
const localFileService = new LocalFileService();
const sshFileService = new SSHFileService();

class FileService implements IFileService {
  private service: IFileService = localFileService;

  private config: any;

  async getService() {
    return {
      service: this.service.type,
      config: this.config,
    };
  }

  async connect(service: 'local' | 'ssh', config: any) {
    switch (service) {
      case 'local':
        this.service = localFileService;
        break;
      case 'ssh':
        this.service = sshFileService;
        break;
      default:
        throw new Error('unknown type');
    }
    this.config = config;
    await this.service.disconnect();
    await this.service.connect(config);
  }

  async disconnect(): Promise<void> {
    return this.service.disconnect();
  }

  read(uri: string): Promise<TreeNode> {
    return this.service.read(uri);
  }
  readdir(uri: string): Promise<TreeNode[]> {
    return this.service.readdir(uri);
  }
  move(uri: string, targetDirUri: string): Promise<TreeNode> {
    return this.service.move(uri, targetDirUri);
  }
  rename(uri: string, name: string): Promise<TreeNode> {
    return this.service.rename(uri, name);
  }
  create(dirUri: string, node: TreeNode): Promise<TreeNode> {
    return this.service.create(dirUri, node);
  }
  remove(uri: string): Promise<void> {
    return this.service.remove(uri);
  }
  readText(uri: string): Promise<string> {
    return this.service.readText(uri);
  }
  writeText(uri: string, content: string): Promise<void> {
    return this.service.writeText(uri, content);
  }
  resolveUri(uri: string): Promise<string> {
    return this.service.resolveUri(uri);
  }
}

export default FileService;
