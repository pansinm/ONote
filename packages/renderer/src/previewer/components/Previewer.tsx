import React from 'react';
import 'github-markdown-css/github-markdown-light.css';
import { ErrorBoundary } from 'react-error-boundary';
import Render from '../markdown/Render';
import useModel from '../hooks/useModel';
import Fallback from './Fallback';

export default function Previewer({ className }: { className: string }) {
  const resource = useModel();
  if (!resource.uri) {
    return null;
  }

  return (
    <>
      {/* <button onClick={() => exportDocx()}>导出docx</button> */}
      <div className={className}>
        <ErrorBoundary FallbackComponent={Fallback} onReset={console.log}>
          <Render {...resource}></Render>
        </ErrorBoundary>
      </div>
    </>
  );
}
