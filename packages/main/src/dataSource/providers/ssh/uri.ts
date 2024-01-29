export const uriToPath = (uri: string) => {
  return decodeURIComponent(new URL(uri).pathname);
};

export const pathToUri = (path: string) => {
  return new URL(path, 'file:///').toString();
};
