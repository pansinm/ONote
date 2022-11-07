import * as monaco from 'monaco-editor';
import {
  findPreviousMatch,
  getFenceContent,
  getTextAfter,
  getTextBefore,
  isInFence,
  isPositionMatch,
  isTextMatch,
  toggleTask,
} from '../utils';

const md = `
    text
    \`\`\`js
    const a = 1;
    \`\`\`
    next
    \`\`\`js
    const b = 1
    \`\`\`
    `;

Object.assign(window, {
  matchMedia: () => ({
    addEventListener: () => {
      // ignore
    },
  }),
});

describe('isMatcher', () => {
  it('string matcher', () => {
    expect(isTextMatch('this is text', 'text')).toBe(true);
  });
  it('regexp matcher', () => {
    expect(isTextMatch('this is text', /is\s/)).toBe(true);
  });
  it('function matcher', () => {
    expect(isTextMatch('this is text', (text) => text.includes('xx'))).toBe(
      false,
    );
  });
});

describe('getTextBefore', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model.dispose();
  });
  it('getTextBefore', () => {
    expect(getTextBefore(model, new monaco.Position(2, 6)).trim()).toBe('t');
  });
});

describe('getTextAfter', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model?.dispose();
  });
  it('getTextAfter', () => {
    expect(getTextAfter(model, new monaco.Position(9, 6)).trim()).toBe('``');
  });
});

describe('isPositionMatch', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model?.dispose();
  });
  it('match fence', () => {
    const position = new monaco.Position(4, 2);
    expect(
      isPositionMatch(model, position, [/```js\s*.*?(?!(```\s))$/, '```']),
    ).toBe(true);
    expect(
      isPositionMatch(model, new monaco.Position(6, 3), [
        /```js\s*.*?(?!(```\s))$/,
        '```',
      ]),
    ).toBe(false);
  });
});

describe('isInFence', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model?.dispose();
  });
  it('在第一个字符出现时', () => {
    const model = monaco.editor.createModel(
      '```js\nconst a = 2;\n```',
      'markdown',
      monaco.Uri.parse('file://x/ddd.md'),
    );
    expect(isInFence(model, new monaco.Position(1, 4), '')).toBe(true);
    expect(isInFence(model, new monaco.Position(1, 4), 'js')).toBe(false);
    expect(isInFence(model, new monaco.Position(2, 4), 'js')).toBe(true);
    model.dispose();
  });
  it('光标在代码块内时，返回true', () => {
    expect(isInFence(model, new monaco.Position(4, 0), 'js')).toBe(true);
    expect(isInFence(model, new monaco.Position(4, 0), 'ts')).toBe(false);
  });
  it('光标跟代码标识```上时,返回false', () => {
    expect(isInFence(model, new monaco.Position(5, 6), 'js')).toBe(false);
  });
  it('光标在第一行末尾', () => {
    expect(isInFence(model, new monaco.Position(4, 15), 'js')).toBe(true);
  });
});

describe('getFenceContent', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model?.dispose();
  });
  it('光标在代码块内', () => {
    expect(getFenceContent(model, new monaco.Position(4, 1))).toBe(
      '    const a = 1;',
    );
  });
});

describe('findPreviousMatchRange', () => {
  let model: monaco.editor.ITextModel;
  beforeAll(() => {
    model = monaco.editor.createModel(
      md,
      'markdown',
      monaco.Uri.parse('file://x/x.md'),
    );
  });
  afterAll(() => {
    model?.dispose();
  });
  it('字符串搜索', () => {
    expect(
      findPreviousMatch(model, new monaco.Position(4, 12), ' ')?.range
        .startColumn,
    ).toBe(10);
  });
  it('正则搜索', () => {
    expect(
      findPreviousMatch(model, new monaco.Position(4, 12), /\s+/)?.range
        .startColumn,
    ).toBe(10);
  });
});

describe('toggleTask', () => {
  it('toggle task line', () => {
    expect(toggleTask('- [ ] task')).toBe('- [x] task');
  });
  it('toggle normal lne', () => {
    expect(toggleTask('- task')).toBe('- task');
  });
});
