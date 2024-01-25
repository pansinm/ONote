import _ from 'lodash';

export function parseStyle(styles: string) {
  const pairs = styles
    .split(';')
    .map((style) => style.split(':').map((part) => part.trim()))
    .filter(([key, value]) => key && value)
    .map(([key, value]) => [
      _.camelCase(key),
      /^\d+$/.test(value) ? parseInt(value, 10) : value,
    ]);
  return _.fromPairs(pairs);
}

export function parseText(text: string) {
  const emojiReg = /:[a-z0-9-+_]+:/g;
  const emojiParts = text.matchAll(emojiReg);
  const results: { type: string; value: string }[] = [];
  let pos = 0;
  for (const part of emojiParts) {
    const index = part.index;
    if (typeof index === 'undefined') {
      continue;
    }
    if (index > pos) {
      results.push({ type: 'text', value: text.slice(pos, index) });
    }
    results.push({ type: 'emoji', value: part?.[0].slice(1, -1) });
    pos = index + part?.[0].length;
  }
  if (pos < text.length) {
    results.push({ type: 'text', value: text.slice(pos) });
  }
  return results;
}

export function isVoidElement(tagName: string) {
  return [
    'br',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'area',
    'base',
    'col',
    'command',
    'embed',
    'keygen',
    'param',
    'source',
    'track',
    'wbr',
  ].includes(tagName);
}
