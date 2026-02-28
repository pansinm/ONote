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

export function selectionToRange(selection: monaco.Selection) {
  const { startLineNumber, startColumn, endLineNumber, endColumn } = selection;
  return new monaco.Range(
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
  );
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

export function applyModelEdits(
  model: monaco.editor.ITextModel,
  edits: monaco.editor.IIdentifiedSingleEditOperation[],
) {
  model.pushStackElement();
  model.pushEditOperations([], edits, () => []);
  model.pushStackElement();
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
  lang = '',
) {
  console.log('DEBUG: Position', position.lineNumber, position.column);
  const prev = model.findPreviousMatch(
    '```',
    position,
    false,
    true,
    null,
    false,
  );
  const next = model.findNextMatch('```', position, false, true, null, false);
  console.log(
    'DEBUG: prev',
    prev
      ? `line ${prev.range.startLineNumber} col ${prev.range.startColumn}`
      : null,
  );
  console.log(
    'DEBUG: next',
    next
      ? `line ${next.range.startLineNumber} col ${next.range.startColumn}`
      : null,
  );
  let openLine = prev?.range.startLineNumber;
  let closeLine = next?.range.startLineNumber;

  console.log('DEBUG: initial openLine', openLine);

  while (openLine && !model.getLineContent(openLine).trim().startsWith('```')) {
    console.log(
      'DEBUG: skipping line',
      openLine,
      'content:',
      JSON.stringify(model.getLineContent(openLine)),
    );
    openLine = openLine - 1;
  }

  while (
    closeLine &&
    !model.getLineContent(closeLine).trim().startsWith('```')
  ) {
    console.log(
      'DEBUG: skipping closeLine',
      closeLine,
      'content:',
      JSON.stringify(model.getLineContent(closeLine)),
    );
    closeLine = closeLine + 1;
  }

  console.log('DEBUG: final openLine', openLine, 'closeLine', closeLine);

  if (openLine && closeLine && openLine < closeLine) {
    const lastLine = model.getLineContent(closeLine);
    console.log('DEBUG: lastLine', JSON.stringify(lastLine));

    if (lastLine.trim() !== '```') {
      console.log('DEBUG: not a valid closing fence');
      return false;
    }

    if (openLine === position.lineNumber) {
      console.log('DEBUG: on opening fence line');
      if (position.column < 4) {
        console.log('DEBUG: column before fence end');
        return false;
      }
      if (!lang) {
        console.log('DEBUG: empty lang, considered on fence');
        console.log('DEBUG: result', true);
        return true;
      }
      console.log('DEBUG: specific lang, not inside fence');
      console.log('DEBUG: result', false);
      return false;
    } else {
      console.log('DEBUG: inside fence body');
      if (lang) {
        const content = model.getLineContent(openLine);
        console.log('DEBUG: opening line content:', JSON.stringify(content));
        const result =
          content.trim().startsWith('```' + lang) &&
          position.lineNumber < closeLine;
        console.log('DEBUG: result', result);
        return result;
      }
      const result = position.lineNumber < closeLine;
      console.log('DEBUG: result', result);
      return result;
    }
  }
  console.log('DEBUG: returning false');
  return false;
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

export function toggleTask(line: string) {
  return line.replace(/^\s*[-*+] \[(x|\s)\]/, (substr, arg) => {
    if (arg === 'x') {
      return substr.replace('[x]', '[ ]');
    } else {
      return substr.replace('[ ]', '[x]');
    }
  });
}
