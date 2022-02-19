import React, { useEffect, useState } from 'react';
import 'github-markdown-css/github-markdown-light.css';
// import usePreview from '../hooks/useMarkdown';
import Render from '../markdown/Render';
import EditorClient from '/@/rpc/EditorClient';
import usePreviewerScrollSync from '../hooks/usePreviewerScrollSync';

export default function Previewer({ className }: { className: string }) {
  const [resource, setResource] = useState({ uri: '', content: '' });
  useEffect(() => {
    const listener = (event: Event) => {
      const { detail } = event as CustomEvent<{ uri: string; content: string }>;
      setResource(detail);
    };
    document.addEventListener('content-changed', listener);
    return () => {
      document.removeEventListener('content-changed', listener);
    };
  }, []);

  if (!resource.uri) {
    return null;
  }

  return (
    <>
      {/* <button onClick={() => exportDocx()}>导出docx</button> */}
      <div className={className}>
        <Render {...resource}></Render>
      </div>
    </>
  );
}
