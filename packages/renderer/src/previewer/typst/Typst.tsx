import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toONoteUri } from '/@/common/utils/uri';
import diagramRenderer from '../ipc/diagramRenderer';

export const Typst = ({ uri, content }: { uri: string; content: string }) => {
  const [ouput, setOutput] = useState<string>('');
  const nextRef = useRef({
    uri,
    content,
    compiling: false,
  });

  const compile = useCallback(async (uri: string, content: string) => {
    const next = nextRef.current;
    next.compiling = true;
    next.uri = uri;
    next.content = content;
    try {
      const output = await diagramRenderer.renderTysp(uri, content, 'svg');
      setOutput(output + '?' + Date.now());
    } catch (err) {
      console.error(err);
    }
    next.compiling = false;
    if (next.uri !== uri || next.content !== content) {
      return compile(next.uri, next.content);
    }
  }, []);

  useEffect(() => {
    const next = nextRef.current;
    if (next.compiling) {
      next.uri = uri;
      next.content = content;
      return;
    }
    compile(uri, content);
  }, [uri, content]);

  return (
    <div>
      <img src={ouput} />
      {/* <iframe
        src={ouput + '?' + Date.now()}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      ></iframe> */}
    </div>
  );
};
