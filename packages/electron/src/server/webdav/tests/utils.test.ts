import { toDataSourceUri } from '../utils';
it('toDataSourceUri', () => {
  expect(toDataSourceUri('/test.md', 'file:///a/b')).toBe(
    'file:///a/b/test.md',
  );
});
