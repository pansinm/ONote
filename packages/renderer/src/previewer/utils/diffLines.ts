import * as Diff from 'diff';

const diffLines = (left: string, right: string) => {
  return Diff.diffLines(left, right);
};

export default diffLines;
