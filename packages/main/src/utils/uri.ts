export const uriToPath = (uri: string) => {
  return decodeURI(new URL(uri).pathname);
};

export const pathToUri = (path: string) => {
  return new URL(path, 'file:///').toString();
};
