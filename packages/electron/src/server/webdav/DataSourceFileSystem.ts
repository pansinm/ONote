import type { Readable, Writable } from 'stream';
import { v2 as webdav } from 'webdav-server';
import { Serializer } from './DatasourceSerializer';
import { toDataSourceUri } from './utils';
import fs from 'fs';
import os from 'os';
import Path from 'path';
import _ from 'lodash';
import { dataSource } from '/@/dataSource';

function getDataSource() {
  return dataSource;
}

function resolveUri(path: string) {
  return toDataSourceUri(path, getDataSource().getRootDirUri());
}

export class _FTPFileSystemResource {
  props: webdav.LocalPropertyManager;
  locks: webdav.LocalLockManager;
  type?: webdav.ResourceType;

  constructor(data?: _FTPFileSystemResource) {
    if (!data) {
      this.props = new webdav.LocalPropertyManager();
      this.locks = new webdav.LocalLockManager();
    } else {
      const rs = data as _FTPFileSystemResource;
      this.props = rs.props;
      this.locks = rs.locks;
    }
  }
}

export class FileSystem extends webdav.FileSystem {
  constructor() {
    super(new Serializer());
    this.resources = {
      '/': new _FTPFileSystemResource(),
    };
  }

  resources: {
    [path: string]: _FTPFileSystemResource;
  };

  protected _fastExistCheck?(
    ctx: webdav.RequestContext,
    path: webdav.Path,
    callback: (exists: boolean) => void,
  ): void {
    callback(true);
  }

  protected _create?(
    path: webdav.Path,
    ctx: webdav.CreateInfo,
    callback: webdav.SimpleCallback,
  ): void {
    ctx.type.isDirectory
      ? getDataSource()
          .mkdir(resolveUri(path.toString()))
          .then(() => callback())
          .catch(callback)
      : getDataSource()
          .write(resolveUri(path.toString()), Buffer.from(''))
          .then(() => callback())
          .catch(callback);
  }

  protected _delete?(
    path: webdav.Path,
    ctx: webdav.DeleteInfo,
    callback: webdav.SimpleCallback,
  ): void {
    getDataSource()
      .delete(resolveUri(path.toString()))
      .then(() => callback())
      .catch(callback);
  }

  protected _openWriteStream?(
    path: webdav.Path,
    ctx: webdav.OpenWriteStreamInfo,
    callback: webdav.ReturnCallback<Writable>,
  ): void {
    const validPath = path.toString().replace(/[<>:"|?*]/g, '');
    const tmp = Path.resolve(
      os.tmpdir(),
      [Date.now(), Path.basename(validPath)].join('-'),
    );

    const stream = fs.createWriteStream(tmp);
    stream.on('finish', async () => {
      console.log('write', path);
      getDataSource()
        .write(resolveUri(validPath), await fs.promises.readFile(tmp))
        .catch(console.error);
    });
    callback(undefined, stream);
  }
  protected _openReadStream?(
    path: webdav.Path,
    ctx: webdav.OpenReadStreamInfo,
    callback: webdav.ReturnCallback<Readable>,
  ): void {
    getDataSource()
      .cache(resolveUri(path.toString()))
      .then((cachePath) => callback(undefined, fs.createReadStream(cachePath)))
      .catch(callback);
  }

  protected _lockManager(
    path: webdav.Path,
    ctx: webdav.LockManagerInfo,
    callback: webdav.ReturnCallback<webdav.ILockManager>,
  ): void {
    let resource = this.resources[path.toString()];
    if (!resource) {
      resource = new _FTPFileSystemResource();
      this.resources[path.toString()] = resource;
    }

    callback(undefined, resource.locks);
  }

  protected _propertyManager(
    path: webdav.Path,
    ctx: webdav.PropertyManagerInfo,
    callback: webdav.ReturnCallback<webdav.IPropertyManager>,
  ): void {
    let resource = this.resources[path.toString()];
    if (!resource) {
      resource = new _FTPFileSystemResource();
      this.resources[path.toString()] = resource;
    }

    callback(undefined, resource.props);
  }

  protected _readDir?(
    path: webdav.Path,
    ctx: webdav.ReadDirInfo,
    callback: webdav.ReturnCallback<string[] | webdav.Path[]>,
  ): void {
    getDataSource()
      .listDir(resolveUri(path.toString()))
      .then((list) =>
        callback(
          undefined,
          list.map((item) => decodeURIComponent(Path.basename(item.uri))),
        ),
      )
      .catch(callback);
  }

  // protected _creationDate?(
  //   path: webdav.Path,
  //   ctx: webdav.CreationDateInfo,
  //   callback: webdav.ReturnCallback<number>,
  // ): void {
  //   // const r = this.resources[path.toString()];
  //   // callback(
  //   //   r ? null : webdav.Errors.ResourceNotFound,
  //   //   r ? r.creationDate : null,
  //   // );
  // }

  // protected _lastModifiedDate?(
  //   path: webdav.Path,
  //   ctx: webdav.LastModifiedDateInfo,
  //   callback: webdav.ReturnCallback<number>,
  // ): void {
  //   // const r = this.resources[path.toString()];
  //   // callback(
  //   //   r ? null : webdav.Errors.ResourceNotFound,
  //   //   r ? r.lastModifiedDate : null,
  //   // );
  // }

  protected _type(
    path: webdav.Path,
    ctx: webdav.TypeInfo,
    callback: webdav.ReturnCallback<webdav.ResourceType>,
  ): void {
    getDataSource()
      .getTreeNode(resolveUri(path.toString()))
      .then((node) =>
        callback(
          undefined,
          node.type === 'directory'
            ? webdav.ResourceType.Directory
            : webdav.ResourceType.File,
        ),
      )
      .catch((err) => {
        callback(
          undefined,
          path.toString().endsWith('/')
            ? webdav.ResourceType.Directory
            : webdav.ResourceType.File,
        );
      });
    //   const r = this.resources[path.toString()];
    //   callback(r ? null : webdav.Errors.ResourceNotFound, r ? r.type : null);
    //
  }
}
