import React from 'react';
import { render } from '@testing-library/react';
import type { Heading } from 'mdast';
import createCtx from '../../createCtx';
import { parse } from '../../../../common/markdown';
import heading from '../heading';
// import { renderChildren } from '../../utils';

const App = ({ head }: { head: Heading }) =>
  heading(
    head,
    // {
    //   // renderChildren: renderChildren,
    // } as any,
    createCtx({
      fileUri: 'file:///test.md',
      ast: { type: 'root', children: [head] },
      rootDirUri: 'file:///',
    }),
  );

test('heading with emoji ', async () => {
  const head = parse('## test :hash:').children[0] as Heading;
  const { findByText } = render(<App head={head} />);
  expect(await findByText('#️⃣')).toBeTruthy();
});
