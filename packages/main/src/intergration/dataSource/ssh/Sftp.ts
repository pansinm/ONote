import type { ConnectConfig, FileEntry, SFTPWrapper, Stats } from 'ssh2';
import { Client } from 'ssh2';

/**
 * promisify ssh2
 */
class Sftp {
  private client = new Client();

  config: ConnectConfig;

  private _sftp?: SFTPWrapper;

  private connectState: 'init' | 'connecting' | 'connected' = 'init';

  constructor(config: ConnectConfig) {
    this.config = config;
  }

  connect() {
    this.connectState = 'connecting';
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.client.sftp((err, sftp) => {
          if (err) {
            reject(err);
            this.connectState = 'init';
          } else {
            this.connectState = 'connected';
            this._sftp = sftp;
            resolve(sftp);
          }
        });
      });
      this.client.on('error', (err) => {
        this._sftp = undefined;
        this.connectState = 'init';
        reject(err);
      });
      this.client.on('close', () => {
        this._sftp = undefined;
        this.connectState = 'init';
      });
      this.client.connect(this.config);
    });
  }

  close() {
    this.client.destroy();
  }

  async getSftp(): Promise<SFTPWrapper> {
    if (!this._sftp) {
      await this.connect();
    }
    if (this._sftp) {
      return this._sftp;
    }
    throw new Error('get sftp failed');
  }

  async readdir(filepath: string): Promise<FileEntry[]> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.readdir(filepath, (err, list) =>
        err ? reject(err) : resolve(list),
      );
    });
  }

  async writeFile(filepath: string, data: Buffer) {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.writeFile(filepath, data, {}, (err) =>
        err ? reject(err) : resolve(null),
      );
    });
  }

  async readFile(filepath: string): Promise<Buffer> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.readFile(filepath, {}, (err, buffer) =>
        err ? reject(err) : resolve(buffer),
      );
    });
  }

  async stat(filepath: string): Promise<Stats> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.stat(filepath, (err, stats) => (err ? reject(err) : resolve(stats)));
    });
  }

  async unlink(filepath: string): Promise<void> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.unlink(filepath, (err) => (err ? reject(err) : resolve()));
    });
  }

  async rmdir(filepath: string): Promise<void> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.rmdir(filepath, (err) => (err ? reject(err) : resolve()));
    });
  }

  async mkdir(filepath: string): Promise<void> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.mkdir(filepath, (err) => (err ? reject(err) : resolve()));
    });
  }

  async rename(source: string, dest: string): Promise<void> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.rename(source, dest, (err) => (err ? reject(err) : resolve()));
    });
  }

  async fastGet(filePath: string, localPath: string): Promise<void> {
    const sftp = await this.getSftp();
    return new Promise((resolve, reject) => {
      sftp.fastGet(filePath, localPath, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }
}

export default Sftp;
