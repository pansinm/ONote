import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import React from 'react';
import { parse, render } from './utils';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';
import diffLines from '../utils/diffLines';
import mainRpcClient from '../rpc/mainRpcClient';

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
  const prevRef = useRef({ content: props.content, uri: props.uri });
  useEffect(() => {
    if (prevRef.current.uri === props.uri) {
      const uri = props.uri;
      const diffs = diffLines(prevRef.current.content, props.content);
      diffs.forEach((diff) => {
        if (!diff.removed) {
          const todoLines = parseTodoLines(diff.value);
          todoLines.forEach((line) => {
            const [_, check, title] =
              /^[-+*]\s+\[(x|\s)\]\s+(.*)/.exec(line) || [];
            const isDone = check.trim();
            mainRpcClient.call(
              'ensureTodo',
              uri,
              title.trim(),
              isDone ? 'done' : 'doing',
            );
          });
        }
        if (diff.removed) {
          const todoLines = parseTodoLines(diff.value);
          todoLines.forEach((line) => {
            const [_, check, title] =
              /^[-+*]\s+\[(x|\s)\]\s+(.*)/.exec(line) || [];
            mainRpcClient.call('deleteTodo', uri, title.trim());
          });
        }
      });
    }
    prevRef.current = { content: props.content, uri: props.uri };
  });
  usePreviewerScrollSync(props.uri, ast);
  return <>{render(props.uri, ast)}</>;
};

export default Render;
