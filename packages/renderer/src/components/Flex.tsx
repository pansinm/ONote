import type { CSSProperties, FC } from 'react';
import { memo, useMemo } from 'react';
import React from 'react';

interface ViewProps extends CSSProperties, React.DOMAttributes<HTMLDivElement> {
  className?: string;
}

const Flex: FC<ViewProps> = memo((props) => {
  // eslint-disable-next-line react/prop-types
  const { className } = props;
  const [attr, style] = useMemo(() => {
    const style: Record<string, any> = {
      display: 'flex',
    };
    const attr: Record<string, any> = {};
    Object.keys(props).forEach((key) => {
      if (['children', 'dangerouslySetInnerHTML'].includes(key)) {
        attr[key] = props[key as 'children' | 'dangerouslySetInnerHTML'];
        return;
      }
      if (/^on[A-Z]/.test(key)) {
        attr[key] = props[key as keyof React.DOMAttributes<HTMLDivElement>];
        return;
      }
      style[key] = props[key as keyof CSSProperties];
    });
    return [attr, style];
  }, [props]);
  return <div className={className} {...attr} style={style}></div>;
});

Flex.displayName = 'Flex';

export default Flex;
