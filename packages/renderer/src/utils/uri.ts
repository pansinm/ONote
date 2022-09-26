export const basename = (uri: string) => {
  const url = new URL(uri);
  return decodeURIComponent(url.pathname.split('/').pop() || '');
};

export const fileType = (uri: string) => {
  const filename = basename(uri);
  if (/\.mdx?$/.test(filename)) {
    return 'markdown';
  }
  if (/^\.[^.]+$/.test(filename)) {
    return 'plaintext';
  }
  if (/^\.(jsx?|tsx?|txt|text|css|html)$/.test(filename)) {
    return 'plaintext';
  }
  return 'unknown';
};

export const isMarkdown = (uri: string) => {
  return fileType(uri) === 'markdown';
};

export const isPlaintext = (uri: string) => {
  return fileType(uri) === 'plaintext';
};
