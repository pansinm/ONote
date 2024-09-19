import type { FC } from 'react';
import React, { useEffect } from 'react';
import { parse } from '/@/common/markdown';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';
import { extname, isPlaintext, isTypst } from '../../common/utils/uri';
import { Code } from './handlers/code';
import type { Root } from 'mdast';
import type { ReactNode } from 'react';
import createCtx from './createCtx';
import { Typst } from '../typst/Typst';

function render(fileUri: string, ast: Root, rootDirUri: string): ReactNode {
  const ctx = createCtx({ fileUri, ast, rootDirUri });
  return ctx.render(ast, ctx) as ReactNode;
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

  if (isTypst(props.uri)) {
    return <Typst uri={props.uri} content={props.content} />;
  }

  return <>{render(props.uri, ast, props.rootDirUri)}</>;
};

export default React.memo(Render);
