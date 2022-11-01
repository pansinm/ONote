import { resolveUri, toONoteUri } from '/@/common/utils/uri';

export const resolveAssetUri = (path: string, ctx: any) => {
  // uri
  if (/^(.*?):\/\//.test(path)) {
    return path;
  }

  try {
    const uri = /^\//.test(path)
      ? resolveUri(ctx.rootDirUri + '/', './' + path)
      : resolveUri(ctx.fileUri, path);
    return toONoteUri(uri);
  } catch (err) {
    return path;
  }
};
