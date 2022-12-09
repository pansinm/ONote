import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import diagramEngine from './engine';
import Block from '../../markdown/handlers/components/Block';
import Icon from '/@/components/Icon';
import { copyElementAsImage } from '../../utils/clipboard';
import { debounce } from 'lodash';

function debounceRenderer(
  onRender: (res: any) => void,
  onError: (err: Error) => void,
) {
  let next = null;
  let rendering = false;
  return debounce(
    async (lang: string, value: string, meta: any) => {
      if (rendering) {
        next = [lang, value, meta];
        return;
      }
      next = [lang, value, meta];
      rendering = true;
      while (next) {
        const [lang, value, meta] = next;
        next = null;
        try {
          const res = await diagramEngine.render(lang, value, meta);
          if (!next) {
            onRender(res);
          }
        } catch (err) {
          onError(err as Error);
        }
      }
      rendering = false;
    },
    300,
    { leading: true, trailing: true },
  );
}

export function Diagram(props: {
  value: string;
  className?: string;
  meta: any;
  lang: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const render = useMemo(() => {
    return debounceRenderer(
      (res) => {
        if (!ref.current) {
          return;
        }
        if (res.type === 'svg') {
          ref.current.innerHTML =
            typeof res.content === 'string'
              ? res.content
              : res.content.join('<br>');
          return;
        }
        if (res.type === 'url') {
          ref.current.innerHTML = `<img src="${res.content}">`;
        }
      },
      (err) => {
        ref.current && (ref.current.innerHTML = (err as Error).message);
      },
    );
  }, []);
  useEffect(() => {
    render(props.lang as any, props.value, props.meta);
  }, [props.value, JSON.stringify(props.meta)]);

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
