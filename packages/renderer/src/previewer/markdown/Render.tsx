import type { FC } from 'react';
import React from 'react';
import { parse, render } from './utils';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';
import { extname, isPlaintext } from '../../common/utils/uri';
import { Code } from './handlers/code';

interface RenderProps {
  uri: string;
  content: string;
  rootDirUri: string;
}

const Render: FC<RenderProps> = (props) => {
  const ast = parse(props.content);
  usePreviewerScrollSync(props.uri, ast);
  if (isPlaintext(props.uri)) {
    return <Code code={props.content} lang={extname(props.uri)}></Code>;
  }
  return <>{render(props.uri, ast, props.rootDirUri)}</>;
};

export default Render;
