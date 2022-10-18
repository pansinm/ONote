import type { FC } from 'react';
import React from 'react';
import { parse, render } from './utils';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';

interface RenderProps {
  uri: string;
  content: string;
}

const parseTodoLines = (input: string) => {
  return input
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-+*]\s+\[(x|\s)\]\s/.test(line));
};

const Render: FC<RenderProps> = (props) => {
  const ast = parse(props.content);
  usePreviewerScrollSync(props.uri, ast);
  return <>{render(props.uri, ast)}</>;
};

export default Render;
