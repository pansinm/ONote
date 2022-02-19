import * as monaco from 'monaco-editor';

export const fsPath2Uri = (fsPath: string) => {
  return monaco.Uri.file(fsPath.replaceAll('\\', '/')).toString();
};

export const uri2fsPath = (uri: string) => {
  return monaco.Uri.parse(uri).fsPath;
};

export const basename = (uri: string) => {
  const fsPath = uri2fsPath(uri);
  return fsPath.split('/').pop() as string;
};
