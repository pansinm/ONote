import type { Root } from 'mdast';

export function createLineClass(position: Root['position']) {
  return `line-start-${position?.start.line} line-end-${position?.end.line}`;
}
