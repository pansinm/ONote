import { parseStyle, parseText } from '../dom';

test('parseStyle', () => {
  expect(parseStyle('position:relative;font-size:14px;left:10')).toEqual({
    position: 'relative',
    fontSize: '14px',
    left: 10,
  });
});

test('parseText', () => {
  // 正常 emoji 识别
  expect(parseText('test:smile:')).toEqual([
    { type: 'text', value: 'test' },
    { type: 'emoji', value: 'smile' },
  ]);

  // emoji 后跟标点符号，正常识别
  expect(parseText('test:smile:.')).toEqual([
    { type: 'text', value: 'test' },
    { type: 'emoji', value: 'smile' },
    { type: 'text', value: '.' },
  ]);

  // emoji 后跟字母，不识别（整个文本作为文本节点）
  expect(parseText('test:smile:a')).toEqual([
    { type: 'text', value: 'test:smile:a' },
  ]);

  // emoji 后跟数字，不识别（整个文本作为文本节点）
  expect(parseText('test:smile:1')).toEqual([
    { type: 'text', value: 'test:smile:1' },
  ]);

  // 多个连续 emoji，都识别
  expect(parseText('test:smile::+1:')).toEqual([
    { type: 'text', value: 'test' },
    { type: 'emoji', value: 'smile' },
    { type: 'emoji', value: '+1' },
  ]);

  // emoji 后跟空格，正常识别
  expect(parseText('test:smile: :+1:')).toEqual([
    { type: 'text', value: 'test' },
    { type: 'emoji', value: 'smile' },
    { type: 'text', value: ' ' },
    { type: 'emoji', value: '+1' },
  ]);

  // emoji 后跟标点符号和空格，正常识别
  expect(parseText('Hello :smile:, world!')).toEqual([
    { type: 'text', value: 'Hello ' },
    { type: 'emoji', value: 'smile' },
    { type: 'text', value: ', world!' },
  ]);
});
