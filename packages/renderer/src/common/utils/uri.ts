import { URI } from 'monaco-editor/esm/vs/base/common/uri';

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

  return 'unknown';
};

export const isMarkdown = (uri: string) => {
  return fileType(uri) === 'markdown';
};

export const isPlaintext = (uri: string) => {
  return fileType(uri) === 'plaintext';
};

export const isUnSupport = (uri: string) => {
  return !['markdown', 'plaintext'].includes(fileType(uri));
};

export const relative = (from: string, to: string) => {
  if (from === to) {
    return '';
  }

  const fromUrl = new URL(from);
  const toUrl = new URL(to);

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
