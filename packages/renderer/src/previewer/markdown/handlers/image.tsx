import React, { useCallback, useEffect, useState } from 'react';
import type { Image as IImage } from 'mdast';
import { resolveAssetUri } from './util/uri';
import Block from './components/Block';
import Icon from '/@/components/Icon';
import { createLineClass } from './util/position';
import tunnel from '../../ipc/tunnel';
import { isEquals } from '/@/common/utils/uri';
import { copyUrlAsImage } from '../../utils/clipboard';
function Image(props: {
  className?: string;
  src: string;
  title?: string;
  alt?: string;
}) {
  const [version, setVersion] = useState(Date.now() + '');
  const srcUrl = new URL(props.src);
  srcUrl.searchParams.set('_', version);
  const src = srcUrl.toString();

  const handleCopyImg = useCallback(() => {
    copyUrlAsImage(src);
  }, [src]);

  useEffect(() => {
    const disposer = tunnel.on('file.content.changed', ({ uri }) => {
      if (isEquals(uri, props.src.replace(/^onote:/, 'file:'))) {
        setVersion(Date.now() + '');
      }
    });
    return () => {
      disposer.dispose();
    };
  }, [props.src]);

  return (
    <Block
      className={props.className}
      icons={
        <Icon type="images" title="复制成图片" onClick={handleCopyImg}></Icon>
      }
    >
      <img
        className={props.className}
        src={src}
        alt={props.alt}
        title={props.title}
      />
    </Block>
  );
}

export default function image(node: IImage, ctx: any) {
  return (
    <Image
      className={createLineClass(node.position)}
      src={resolveAssetUri(node.url, ctx)}
      alt={node.alt || undefined}
      title={node.title || undefined}
    />
  );
}
