import type { Handlers } from '../markdown/handlers/interface';
import handlersManager from '../markdown/handlers/manager';

import React, { useCallback, useRef } from 'react';
import type { Code } from 'mdast';
import { useDebounce } from 'react-use';
import diagramEngine from '../diagram/engine';
import Block from '../markdown/handlers/components/Block';
import Icon from '/@/components/Icon';
import { copyElementAsImage } from '../utils/clipboard';

function Diagram(props: {
  value: string;
  className?: string;
  meta: any;
  lang: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const renderingRef = useRef(false);
  useDebounce(
    async () => {
      if (!ref.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        if (!props.value) {
          ref.current.innerHTML = '';
          return;
        }
        const res = await diagramEngine.render(
          props.lang as any,
          props.value,
          props.meta,
        );
        if (!ref.current) {
          return;
        }
        if (res.type === 'svg') {
          ref.current.innerHTML =
            typeof res.content === 'string'
              ? res.content
              : res.content.join('\n');
          return;
        }
        if (res.type === 'url') {
          ref.current.innerHTML = `<img src="${res.content}">`;
        }
      } catch (err) {
        ref.current && (ref.current.innerHTML = (err as Error).message);
      } finally {
        renderingRef.current = false;
      }
    },
    200,
    [props.value, JSON.stringify(props.meta)],
  );

  const handleCopyImg = useCallback(() => {
    copyElementAsImage(ref.current!);
  }, []);

  return (
    <Block
      className={props.className}
      icons={
        <Icon type="images" title="复制成图片" onClick={handleCopyImg}></Icon>
      }
    >
      <div ref={ref}></div>
    </Block>
  );
}

export function parseMeta(meta = '') {
  return meta
    .split(',')
    .map((item) => item.split('='))
    .reduce((options, [key, val]) => {
      if (!key) return options;
      return { ...options, [key]: val };
    }, {});
}

const enhanceHandlers = (handlers: Handlers) => {
  const code = handlers.code;
  function codeHandler(node: Code, ctx: any): React.ReactNode {
    if (node.lang && diagramEngine.isDiagram(node.lang)) {
      return (
        <Diagram
          lang={node.lang}
          className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
          meta={parseMeta(node.meta || '')}
          value={node.value}
        />
      );
    }
    return code(node, ctx);
  }
  return {
    ...handlers,
    code: codeHandler,
  };
};

export const install = () => {
  handlersManager.setHandlers(enhanceHandlers(handlersManager.getHandlers()));
};
