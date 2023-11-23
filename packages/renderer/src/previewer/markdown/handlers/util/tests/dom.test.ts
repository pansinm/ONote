import { parseStyle, parseText } from '../dom';

test('parseStyle', () => {
  expect(parseStyle('position:relative;font-size:14px;left:10')).toEqual({
    position: 'relative',
    fontSize: '14px',
    left: 10,
  });
});

test('parseText', () => {
  expect(parseText('test:smile::+1:x')).toEqual([
    { type: 'text', value: 'test' },
    { type: 'emoji', value: 'smile' },
    { type: 'emoji', value: '+1' },
    { type: 'text', value: 'x' },
  ]);
});
