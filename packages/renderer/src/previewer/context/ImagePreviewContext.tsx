import React, { createContext, useCallback, useContext, useState } from 'react';
import type { PreviewType } from '../components/ImagePreviewModal';

interface ImagePreviewContextType {
  isOpen: boolean;
  previewSrc?: string;
  previewType?: PreviewType;
  previewContent?: string;
  openPreview: (src: string, type: PreviewType, content?: string) => void;
  closePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | null>(null);

export function ImagePreviewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>();
  const [previewType, setPreviewType] = useState<PreviewType>('image');
  const [previewContent, setPreviewContent] = useState<string>();

  const openPreview = useCallback((src: string, type: PreviewType, content?: string) => {
    setPreviewSrc(src);
    setPreviewType(type);
    setPreviewContent(content);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setPreviewSrc(undefined);
    setPreviewContent(undefined);
  }, []);

  return (
    <ImagePreviewContext.Provider value={{ isOpen, previewSrc, previewType, previewContent, openPreview, closePreview }}>
      {children}
    </ImagePreviewContext.Provider>
  );
}

export function useImagePreview() {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error('useImagePreview must be used within ImagePreviewProvider');
  }
  return context;
}
