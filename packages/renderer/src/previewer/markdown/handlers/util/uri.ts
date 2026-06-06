import { resolveMarkdownLinkUri, toONoteUri } from '/@/common/utils/uri';

export const resolveAssetUri = (path: string, ctx: any) => {
  // uri
  if (/^(.*?):\/\//.test(path)) {
    return path;
  }

  try {
    const uri = resolveMarkdownLinkUri(path, ctx.fileUri, ctx.rootDirUri);
    return toONoteUri(uri);
  } catch (err) {
    return path;
  }
};
