import { FileSystem } from './DataSourceFileSystem';
import type { v2 as webdav } from 'webdav-server';

export class Serializer implements webdav.FileSystemSerializer {
  uid() {
    return 'DataSourceSerializer-1.0.0';
  }

  serialize(fs: FileSystem, callback: webdav.ReturnCallback<any>) {
    callback(undefined, {});
  }

  unserialize(
    serializedData: any,
    callback: webdav.ReturnCallback<webdav.FileSystem>,
  ) {
    const fs = new FileSystem();
    callback(undefined, fs);
  }
}
