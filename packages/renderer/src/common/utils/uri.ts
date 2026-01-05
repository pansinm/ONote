import * as uri from 'monaco-editor/esm/vs/base/common/uri';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('URIUtils');

const URI = uri.URI;

export const pathanme = (uri: string) => {
  return new URL(uri).pathname;
};

export const basename = (uri: string) => {
  try {
    return decodeURIComponent(pathanme(uri).split('/').pop() || '');
  } catch (err) {
    return decodeURIComponent(uri.split('/').pop() || '');
  }
};

export const extname = (uri: string) => {
  return basename(uri).split('.').pop() || '';
};

export const fileType = (uri: string) => {
  const filename = basename(uri);
  if (/\.mdx?$/.test(filename)) {
    return 'markdown';
  }
  if (/^\.[^.]+$/.test(filename)) {
    return 'plaintext';
  }
  if (/\.(jsx?|tsx?|txt|text|css|html|json)$/.test(filename)) {
    return 'plaintext';
  }
  if (/\.(png|jpe?g|gif|webp)$/.test(filename)) {
    return 'image';
  }

  if (/\.typ$/.test(filename)) {
    return 'typst';
  }

  return 'unknown';
};

export const isMarkdown = (uri: string) => {
  return fileType(uri) === 'markdown';
};

export const isPlaintext = (uri: string) => {
  return fileType(uri) === 'plaintext';
};

export const isTypst = (uri: string) => {
  return fileType(uri) === 'typst';
};

export const isUnSupport = (uri: string) => {
  return !['markdown', 'plaintext'].includes(fileType(uri));
};

export const relative = (from: string, to: string) => {
  logger.debug('Computing relative path', { from, to });
  if (from === to) {
    return '';
  }

  const fromUrl = new URL(URI.parse(from).toString());
  const toUrl = new URL(URI.parse(to).toString());

  if (fromUrl.host !== toUrl.host) {
    return to;
  }

  if (fromUrl.protocol !== toUrl.protocol) {
    return to;
  }

  // left to right, look for closest common path segment
  const fromSegments = fromUrl.pathname.slice(1).split('/');
  const toSegments = toUrl.pathname.slice(1).split('/');

  if (fromUrl.pathname === toUrl.pathname) {
    if (toUrl.pathname[toUrl.pathname.length - 1] == '/') {
      return '.';
    } else {
      return toSegments[toSegments.length - 1];
    }
  }

  while (fromSegments[0] === toSegments[0]) {
    fromSegments.shift();
    toSegments.shift();
  }

  let length = fromSegments.length - toSegments.length;
  if (length > 0) {
    if (from.endsWith('/')) {
      toSegments.unshift('..');
    }
    while (length--) {
      toSegments.unshift('..');
    }
    return toSegments.join('/');
  } else if (length < 0) {
    return toSegments.join('/');
  } else {
    length = toSegments.length - 1;
    while (length--) {
      toSegments.unshift('..');
    }
    return toSegments.join('/');
  }
};

export const resolveUri = (uri: string, relative: string) => {
  return new URL(relative, uri).toString();
};

export const toONoteUri = (uri: string) => {
  return uri.replace(/^file:/, 'onote:');
};

export const toFileUri = (uri: string) => {
  return uri.replace(/^onote:/, 'file:');
};

export const isEquals = (uri1?: string, uri2?: string) => {
  if (!uri1 || !uri2) {
    return false;
  }
  try {
    // 同一使用 Monaco URI
    return URI.parse(uri1).toString() === URI.parse(uri2).toString();
  } catch (err) {
    return uri1 === uri2;
  }
};

export const getParentUri = (uri: string) => {
  const uriObj = URI.parse(uri);
  uriObj.path = uriObj.path.replace(/\/[^/]*$/, '');
  return uriObj.toString();
};
