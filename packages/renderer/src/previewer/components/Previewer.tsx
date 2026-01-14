import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Render from '../markdown/Render';
import useModel from '../hooks/useModel';
import { usePreviewerSelection } from '../hooks/usePreviewerSelection';
import Fallback from './Fallback';
import { getLogger } from '/@/shared/logger';
import('github-markdown-css/github-markdown.css');

const logger = getLogger('Previewer');

export default function Previewer({ className }: { className: string }) {
  const resource = useModel();
  usePreviewerSelection();

  if (!resource.uri) {
    return null;
  }

  return (
    <>
      {/* <button onClick={() => exportDocx()}>导出docx</button> */}
      <div className={className}>
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={(...args) => logger.debug('ErrorBoundary reset', ...args)}
          onError={(error) => logger.error('ErrorBoundary error', error)}
        >
          <Render {...resource}></Render>
        </ErrorBoundary>
      </div>
    </>
  );
}
