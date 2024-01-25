import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Render from '../markdown/Render';
import useModel from '../hooks/useModel';
import Fallback from './Fallback';
import { Toolbar } from './SelectionToolbar';
import('github-markdown-css/github-markdown.css');

export default function Previewer({ className }: { className: string }) {
  const resource = useModel();

  if (!resource.uri) {
    return null;
  }

  return (
    <>
      {/* <button onClick={() => exportDocx()}>导出docx</button> */}
      <div className={className}>
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={console.log}
          onError={console.log}
        >
          <Render {...resource}></Render>
          <Toolbar />
        </ErrorBoundary>
      </div>
    </>
  );
}
