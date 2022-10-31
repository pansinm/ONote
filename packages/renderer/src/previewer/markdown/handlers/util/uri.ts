export const resolveUri = (path: string, ctx: any) => {
  // uri
  if (/^(.*?):\/\//.test(path)) {
    return path;
  }

  console.log(path, ctx);

  try {
    if (/^\//.test(path)) {
      return new URL(ctx.rootDirUri.replace(/\/+$/, '') + path)
        .toString()
        .replace('file:', 'onote:');
    }
    return new URL(path, ctx.fileUri).toString().replace('file:', 'onote:');
  } catch (err) {
    return path;
  }
};
