export const resolveUri = (path: string, ctx: any) => {
  // uri
  if (/^(.*?):\/\//.test(path)) {
    return path;
  }

  return new URL(path, ctx.fileUri).toString().replace('file:', 'asset:');
};
