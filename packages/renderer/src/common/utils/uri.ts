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

export const relative = (fromUri: string, toUri: string) => {
  const fromPath = pathanme(fromUri);
  const toPath = pathanme(toUri);
  throw new Error('Not implement yet!');
};

export const resolveUri = (uri: string, relative: string) => {
  return new URL(relative, uri.replace(/\/?$/, '/')).toString();
};
