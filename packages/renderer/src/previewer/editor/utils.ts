import type { Node } from 'mdast';
import type { Range } from '../ipc/editor';

export function positionToRange(position: Node['position']): Range {
  const { start, end } = position || {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 1 },
  };
  return {
    startLineNumber: start.line,
    startColumn: start.column,
    endLineNumber: end.line,
    endColumn: end.column,
  };
}
