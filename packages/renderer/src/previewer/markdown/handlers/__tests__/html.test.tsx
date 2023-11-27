import * as React from 'react';
import { render } from '@testing-library/react';
import type { HTML } from 'mdast';
import html from '../html';

const App: React.FC<{ node: HTML }> = ({ node }) => {
  return (
    <>
      {html(node, {
        fileUri: 'file:///test/file.md',
        rootDirUri: 'file:///test',
      } as any)}
    </>
  );
};

test('render html', () => {
  const { container, unmount, rerender } = render(
    <App node={{ type: 'html', value: '<p>test</p>' }} />,
  );
  expect(container.firstElementChild?.tagName).toBe('P');
  expect(container.textContent).toBe('test');

  rerender(<App node={{ type: 'html', value: '<p>test updated</p>' }} />);

  expect(container.textContent).toBe('test updated');
});
