import { findLastIndex } from 'lodash';
import * as monaco from 'monaco-editor';

type Matcher = RegExp | string | ((text: string) => boolean);

export function getCurrentRange(editor: monaco.editor.ICodeEditor) {
  const selection = editor?.getSelection();
  if (selection) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      selection;
    return new monaco.Range(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
    );
  }
  return undefined;
}

export function isTextMatch(text: string, matcher: Matcher) {
  if (typeof matcher === 'string') {
    return text.includes(matcher);
  }
  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }
  return matcher(text);
}

export function getTextBefore(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
) {
  const beforeRange = new monaco.Range(
    1,
    1,
    position.lineNumber,
    position.column,
  );
  return model.getValueInRange(beforeRange);
}

export function getTextAfter(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
) {
  const modelRange = model.getFullModelRange();
  const afterRange = new monaco.Range(
    position.lineNumber,
    position.column,
    modelRange.endLineNumber,
    modelRange.endColumn,
  );
  return model.getValueInRange(afterRange);
}

export function isPositionMatch(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  [beforeMather, afterMatcher]: [Matcher, Matcher],
) {
  const beforeText = getTextBefore(model, position);
  const afterText = getTextAfter(model, position);
  return (
    isTextMatch(beforeText, beforeMather) &&
    isTextMatch(afterText, afterMatcher)
  );
}

export function isInFence(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  lang: string,
) {
  const range = new monaco.Range(
    position.lineNumber,
    position.column - 2,
    position.lineNumber,
    position.column + 2,
  );
  const content = model.getValueInRange(range);
  if (/```/.test(content)) {
    return false;
  }
  const reg = new RegExp(`\`\`\`${lang}\\s*.*?(?!(\`\`\`))$`, 'm');
  return isPositionMatch(model, position, [reg, '```']);
}

export function getFenceContent(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
) {
  const beforeText = getTextBefore(model, position);
  const afterText = getTextAfter(model, position);
  const beforeIndex = beforeText.lastIndexOf('```');
  const afterIndex = afterText.indexOf('```');
  return (
    beforeText
      .slice(beforeIndex)
      .replace(/```.*?\n/, '')
      .trimStart() + afterText.slice(0, afterIndex).trimEnd()
  );
}

export function findPreviousMatch(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  searchString: string | RegExp,
) {
  const isReg = searchString instanceof RegExp;
  const match = model.findPreviousMatch(
    isReg ? searchString.source : searchString,
    position,
    isReg,
    true,
    null,
    false,
  );
  return match;
}
