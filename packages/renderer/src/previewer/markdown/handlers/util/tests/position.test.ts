import { createLineClass } from '../position';

test('when position is exists, createLineClass return class', () => {
  expect(
    createLineClass({
      start: { line: 1, column: 1 },
      end: { line: 2, column: 2 },
    }),
  ).toBe('line-start-1 line-end-2');
});

test('when position is undefined, createLineClass return empty', () => {
  expect(createLineClass(undefined)).toBe('');
});
