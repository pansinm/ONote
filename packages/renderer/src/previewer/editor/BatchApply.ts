import type { RootContent, Parent } from 'mdast';
import type { IEdit } from '../ipc/editor';
import editor from '../ipc/editor';
import { stringify } from '/@/common/markdown';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('BatchApply');

class BatchApply {
  private static editsMap: Record<string, IEdit[]> = {};
  private static timeout = 0;
  createReplaceEdit(
    node: RootContent | Parent,
    replacer: RootContent | Parent,
  ) {
    const { start, end } = node.position!;
    return {
      range: {
        startLineNumber: start.line,
        startColumn: start.column,
        endLineNumber: end.line,
        endColumn: end.column,
      },
      text: stringify(replacer).trim(),
    };
  }

  private commit() {
    const editsMap = BatchApply.editsMap;
    BatchApply.editsMap = {};
    Object.keys(editsMap).forEach((uri) => {
      logger.debug('Committing edits', { uri, editCount: editsMap[uri]?.length });
      editor.applyEdits(uri, editsMap[uri] || []);
    });
  }

  applyLater(fileUri: string, edit: IEdit, delay = 0) {
    clearTimeout(BatchApply.timeout);
    const edits = BatchApply.editsMap[fileUri] || [];
    BatchApply.editsMap[fileUri] = [...edits, edit];
    setTimeout(() => this.commit(), delay);
  }
}

export default BatchApply;
