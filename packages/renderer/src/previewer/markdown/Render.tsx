import type { FC } from 'react';
import React from 'react';
import { parse } from './parser';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';
import { extname, isPlaintext } from '../../common/utils/uri';
import { Code } from './handlers/code';
import type { Root } from 'mdast';
import type { ReactNode } from 'react';
import createCtx from './createCtx';

function render(fileUri: string, ast: Root, rootDirUri: string): ReactNode {
  const ctx = createCtx({ fileUri, ast, rootDirUri });
  return ctx.render(ast, ctx);
}

interface RenderProps {
  uri: string;
  content: string;
  rootDirUri: string;
  lineNumber?: number;
}

const Render: FC<RenderProps> = (props) => {
  const ast = parse(props.content);
  usePreviewerScrollSync(props.uri, ast, props.lineNumber);
  if (isPlaintext(props.uri)) {
    return <Code code={props.content} lang={extname(props.uri)}></Code>;
  }
  return <>{render(props.uri, ast, props.rootDirUri)}</>;
};

export default Render;
