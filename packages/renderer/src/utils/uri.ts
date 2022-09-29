export const basename = (uri: string) => {
  const url = new URL(uri);
  return decodeURIComponent(url.pathname.split('/').pop() || '');
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
