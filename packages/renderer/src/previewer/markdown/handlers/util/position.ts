import type { Root } from 'mdast';

export function createLineClass(position: Root['position']) {
  if (!position) {
    return '';
  }
  return `line-start-${position?.start.line} line-end-${position?.end.line}`;
}
