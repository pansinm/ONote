export function toDataSourceUri(webdavPath: string, rootDirUri: string) {
  const rootUri = rootDirUri.replace(/\/?$/, '/');
  const relativePath = webdavPath.replace(/^\//, './');
  return new URL(relativePath, rootUri).toString();
}
