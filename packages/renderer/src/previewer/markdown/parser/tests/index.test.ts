import { stringify } from '..';

test('stringify emoji', () => {
  expect(stringify({ type: 'emoji', name: 'hash' } as any)).toBe(':hash:');
});
