import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import diagramEngine from './engine';
import Block from '../../markdown/handlers/components/Block';
import Icon from '/@/components/Icon';
import { copyElementAsImage } from '../../utils/clipboard';
import { debounce } from 'lodash';
import { useImagePreview } from '../../context/ImagePreviewContext';

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
  const [renderedContent, setRenderedContent] = useState<string>('');
  const { openPreview } = useImagePreview();
  const render = useMemo(() => {
    return debounceRenderer(
      (res) => {
        if (!ref.current) {
          return;
        }
        let content = '';
        if (res.type === 'svg') {
          content = typeof res.content === 'string'
            ? res.content
            : res.content.join('<br>');
          ref.current.innerHTML = content;
        } else if (res.type === 'url') {
          content = `<img src="${res.content}">`;
          ref.current.innerHTML = content;
        }
        setRenderedContent(content);
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

  const handleDoubleClick = useCallback(() => {
    if (renderedContent) {
      openPreview('', 'diagram', renderedContent);
    }
  }, [renderedContent, openPreview]);

  return (
    <Block
      className={props.className}
      icons={
        <Icon type="images" title="复制成图片" onClick={handleCopyImg}></Icon>
      }
    >
      <div ref={ref} onDoubleClick={handleDoubleClick}></div>
    </Block>
  );
}
