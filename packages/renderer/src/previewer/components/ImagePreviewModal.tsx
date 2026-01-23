import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import Draggable from 'react-draggable';
import { observer } from 'mobx-react-lite';
import Icon from '/@/components/Icon';
import styles from './ImagePreviewModal.module.scss';

export type PreviewType = 'image' | 'diagram' | 'typst';

export interface ImagePreviewModalProps {
  isOpen: boolean;
  src?: string;
  type?: PreviewType;
  content?: string;
  onClose: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 5.0;
const ZOOM_STEP = 0.1;

function ImagePreviewModalComponent({
  isOpen,
  src,
  type = 'image',
  content,
  onClose,
}: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: Event) => {
    const wheelEvent = e as WheelEvent;
    wheelEvent.preventDefault();
    const delta = wheelEvent.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      const modalContent = document.querySelector(`.${styles.PreviewModal}`);
      if (modalContent) {
        modalContent.addEventListener('wheel', handleWheel as EventListener, {
          passive: false,
        });
      }
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        modalContent?.removeEventListener(
          'wheel',
          handleWheel as EventListener,
        );
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, handleWheel, onClose]);

  const overlayStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  };

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
  }, []);

  const handleClose = useCallback(() => {
    setScale(1);
    onClose();
  }, [onClose]);

  const renderContent = () => {
    if (type === 'image' && src) {
      return (
        <img
          src={src}
          alt="Preview"
          className={styles.PreviewImage}
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
      );
    }
    if ((type === 'diagram' || type === 'typst') && content) {
      return (
        <div
          className={styles.SvgContainer}
          style={{ transform: `scale(${scale})` }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return null;
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      shouldCloseOnEsc={false}
      className={styles.PreviewModal}
      overlayClassName={styles.Overlay}
      style={{ overlay: overlayStyle }}
      appElement={document.getElementById('app')!}
    >
      <div className={styles.Content}>
        <Draggable
          nodeRef={containerRef as React.RefObject<HTMLDivElement>}
          bounds="parent"
          handle={`.${styles.DragHandle}`}
        >
          <div ref={containerRef} className={styles.DraggableContainer}>
            <div className={styles.DragHandle} />
            <button className={styles.CloseButton} onClick={handleClose}>
              <Icon type="x-lg" size={20} />
            </button>
            <div className={styles.ImageContainer}>{renderContent()}</div>
            <div className={styles.ZoomControls}>
              <button
                className={styles.ZoomButton}
                onClick={handleZoomOut}
                disabled={scale <= MIN_SCALE}
              >
                <Icon type="dash" size={16} />
              </button>
              <button className={styles.ZoomButton} onClick={handleReset}>
                {Math.round(scale * 100)}%
              </button>
              <button
                className={styles.ZoomButton}
                onClick={handleZoomIn}
                disabled={scale >= MAX_SCALE}
              >
                <Icon type="plus" size={16} />
              </button>
            </div>
          </div>
        </Draggable>
      </div>
    </ReactModal>
  );
}

export default memo(observer(ImagePreviewModalComponent));
