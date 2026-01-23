import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ImagePreviewModal from '../ImagePreviewModal';
import type { ImagePreviewModalProps } from '../ImagePreviewModal';
import { ImagePreviewProvider } from '../../context/ImagePreviewContext';

jest.mock('bootstrap-icons/font/bootstrap-icons.css', () => ({}));
jest.mock('react-draggable', () => {
  return function MockDraggable({ children }: { children: React.ReactNode }) {
    return <div data-testid="draggable">{children}</div>;
  };
});
jest.mock('../ImagePreviewModal.module.scss', () => ({
  PreviewModal: 'preview-modal',
  Content: 'content',
  DraggableContainer: 'draggable-container',
  DragHandle: 'drag-handle',
  CloseButton: 'close-button',
  ImageContainer: 'image-container',
  PreviewImage: 'preview-image',
  SvgContainer: 'svg-container',
  ZoomControls: 'zoom-controls',
  ZoomButton: 'zoom-button',
  ZoomLevel: 'zoom-level',
}));

const defaultProps: ImagePreviewModalProps = {
  isOpen: false,
  onClose: jest.fn(),
};

describe('ImagePreviewModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal {...defaultProps} />
      </ImagePreviewProvider>,
    );
    expect(screen.queryByTestId('draggable')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal {...defaultProps} isOpen src="test.jpg" />
      </ImagePreviewProvider>,
    );
    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should render image when type is image', () => {
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal {...defaultProps} isOpen src="test.jpg" type="image" />
      </ImagePreviewProvider>,
    );
    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'test.jpg');
  });

  it('should render SVG content when type is diagram', () => {
    const svgContent = '<svg>test</svg>';
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal
          {...defaultProps}
          isOpen
          type="diagram"
          content={svgContent}
        />
      </ImagePreviewProvider>,
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal {...defaultProps} isOpen onClose={onClose} />
      </ImagePreviewProvider>,
    );
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('should show 100% zoom level when opened', () => {
    render(
      <ImagePreviewProvider>
        <ImagePreviewModal {...defaultProps} isOpen src="test.jpg" />
      </ImagePreviewProvider>,
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
