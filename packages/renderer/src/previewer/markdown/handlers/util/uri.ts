export const resolveUri = (path: string, ctx: any) => {
  // uri
  if (/^(.*?):\/\//.test(path)) {
    return path;
  }

  try {
    return new URL(path, ctx.fileUri).toString().replace('file:', 'onote:');
  } catch (err) {
    return path;
  }
};
