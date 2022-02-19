/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import type { Code as ICode } from 'mdast';
import React, { useCallback, useEffect, useRef } from 'react';
import Block from './components/Block';
import Prism from './util/Prism';
import cz from 'classnames';
import Icon from '/@/components/Icon';
import lineBreak from '@sinm/prism-line-break';
import { copyElementAsImage } from '../../shared/utils/clipboard';

interface CodeProps {
  lang?: string;
  code: string;
  meta?: string | null;
  ref?: React.RefObject<HTMLPreElement>;
}
const Code = React.forwardRef<HTMLPreElement, CodeBlockProps>((props, ref) => {
  const codeRef = useRef<HTMLElement>(null);
  const { lang, code } = props;
  useEffect(() => {
    lineBreak(codeRef.current!);
  }, []);
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [lang, code]);
  const className = cz({
    [`language-${lang}`]: lang,
  });
  return (
    <pre className="line-numbers" ref={ref}>
      <code className={className} ref={codeRef} lang={lang}>
        {props.code}
      </code>
    </pre>
  );
});

export interface CodeBlockProps extends CodeProps {
  className?: string;
}

function CodeBlock(props: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const handleCopyImg = useCallback(() => {
    const pre = codeRef.current;
    if (pre) {
      copyElementAsImage(pre);
    }
  }, []);
  return (
    <Block
      className={props.className}
      icons={
        <Icon type="images" title="复制成图片" onClick={handleCopyImg}></Icon>
      }
    >
      <Code
        ref={codeRef}
        lang={props.lang}
        code={props.code}
        meta={props.meta}
      ></Code>
    </Block>
  );
}

export default function code(node: ICode, ctx: any) {
  return (
    <CodeBlock
      code={node.value}
      meta={node.meta}
      lang={node.lang || undefined}
      className={`line-end-${node.position?.end.line}  line-start-${node.position?.start.line}`}
    ></CodeBlock>
  );
}
