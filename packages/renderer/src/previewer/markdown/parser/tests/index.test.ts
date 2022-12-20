import { parse, stringify } from '..';

test('stringify emoji', () => {
  expect(stringify({ type: 'emoji', name: 'hash' } as any)).toBe(':hash:');
});

test('parse emoji', () => {
  expect(parse(':hash:')).toMatchObject({
    type: 'root',
    children: [
      { type: 'paragraph', children: [{ type: 'emoji', name: 'hash' }] },
    ],
  });
});
