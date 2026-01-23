import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Render from '../markdown/Render';
import useModel from '../hooks/useModel';
import { usePreviewerSelection } from '../hooks/usePreviewerSelection';
import Fallback from './Fallback';
import { getLogger } from '/@/shared/logger';
import { ImagePreviewProvider, useImagePreview } from '../context/ImagePreviewContext';
import ImagePreviewModal from './ImagePreviewModal';
import('github-markdown-css/github-markdown.css');

const logger = getLogger('Previewer');

function PreviewerContent({ className }: { className: string }) {
  const resource = useModel();
  usePreviewerSelection();
  const { isOpen, previewSrc, previewType, previewContent, closePreview } = useImagePreview();

  if (!resource.uri) {
    return null;
  }

  return (
    <>
      <div className={className}>
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={(...args) => logger.debug('ErrorBoundary reset', ...args)}
          onError={(error) => logger.error('ErrorBoundary error', error)}
        >
          <Render {...resource}></Render>
        </ErrorBoundary>
      </div>
      <ImagePreviewModal
        isOpen={isOpen}
        src={previewSrc}
        type={previewType}
        content={previewContent}
        onClose={closePreview}
      />
    </>
  );
}

export default function Previewer({ className }: { className: string }) {
  return (
    <ImagePreviewProvider>
      <PreviewerContent className={className} />
    </ImagePreviewProvider>
  );
}
