import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import MonacoEditor from '../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import UnSupport from './UnSupport';
import { filePanelManager } from '../../frame';
import { isEquals, isMarkdown } from '/@/common/utils/uri';
import Toolbar from './Toolbar';
import stores from '../../stores';
import LLMBoxFrame from '../LLMBox/LLMBoxFrame';
import { DragIndicator, DragHandle } from '/@/components/DragBarNew';

interface DragState {
  isDragging: boolean;
  type: 'editor-preview' | 'llmbox' | null;
  startX: number;
  currentX: number;
}

interface MarkdownResourcePanelProps {
  uri: string;
}

function Previewer({ previewerUri }: { previewerUri?: string }) {
  const [renderred, setRendered] = useState<string[]>([]);
  useEffect(() => {
    setRendered((rendered) => {
      if (previewerUri && !renderred.includes(previewerUri)) {
        return rendered.concat(previewerUri);
      }
      return rendered;
    });
  }, [previewerUri]);

  return (
    <>
      {renderred.map((uri) => (
        <iframe
          key={uri}
          className="fullfill"
          style={{ display: isEquals(uri, previewerUri) ? 'block' : 'none', zIndex: 1 }}
          name="previewer"
          src={uri}
        />
      ))}
    </>
  );
}

const FilePanel: FC<MarkdownResourcePanelProps> = observer((props) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    type: null,
    startX: 0,
    currentX: 0,
  });

  const panel = filePanelManager.getPanel(props.uri);
  const previewerUri = panel?.previewer;
  const layout = stores.layoutStore.layout;

  const showEditorOnly = layout === 'editor-only' || !previewerUri;
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      setDragState((prev) => ({ ...prev, currentX: relativeX }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const containerRect = containerRef.current!.getBoundingClientRect();
      const delta = e.clientX - dragState.startX;
      const containerWidth = containerRect.width;

      const root = document.documentElement;

      if (dragState.type === 'editor-preview') {
        const editorWidthStr = getComputedStyle(document.documentElement).getPropertyValue('--editor-width').trim();
        const editorWidth = parseFloat(editorWidthStr) || 50;
        const currentEditorPixels = (editorWidth / 100) * containerWidth;
        const newEditorPixels = currentEditorPixels + delta;
        const newWidth = (newEditorPixels / containerWidth) * 100;
        root.style.setProperty('--editor-width', `${Math.max(10, Math.min(90, newWidth))}%`);
      } else if (dragState.type === 'llmbox') {
        const llmboxWidthStr = getComputedStyle(document.documentElement).getPropertyValue('--llmbox-width').trim();
        const llmboxWidth = parseFloat(llmboxWidthStr) || 30;
        const currentLlmboxPixels = (llmboxWidth / 100) * containerWidth;
        const newLlmboxPixels = currentLlmboxPixels - delta;
        const newWidth = (newLlmboxPixels / containerWidth) * 100;
        root.style.setProperty('--llmbox-width', `${Math.max(10, Math.min(50, newWidth))}%`);
      }

      setDragState({ isDragging: false, type: null, startX: 0, currentX: 0 });
    };

    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  const handleStartDrag = (type: 'editor-preview' | 'llmbox', startX: number) => {
    setDragState({
      isDragging: true,
      type,
      startX,
      currentX: 0,
    });
  };

  return (
    <>
      <div
        className="fullfill"
        style={{
          display: panel ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        {isMarkdown(props.uri) && <Toolbar />}
        <div
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
          }}
          ref={containerRef}
        >
          <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
            <div
              className="fill-height editor-container"
              ref={editorContainerRef}
              style={{
                maxWidth: '100%',
                overflowY: 'hidden',
                width: showEditorOnly ? '100%' : 'var(--editor-width)',
                position: 'relative',
                zIndex: 1000,
                display:
                  panel?.editable && layout !== 'previewer-only'
                    ? 'block'
                    : 'none',
              }}
            >
              <MonacoEditor
                needLoad={/\.mdx?$/.test(props.uri)}
                uri={props.uri}
              />
              {!showEditorOnly && (
                <DragHandle
                  type="editor-preview"
                  right="-2px"
                  onStartDrag={handleStartDrag}
                />
              )}
            </div>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: showEditorOnly ? 'none' : 'flex',
              }}
            >
              {dragState.isDragging && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                    background: 'transparent',
                  }}
                ></div>
              )}
              <Previewer previewerUri={previewerUri} />
            </div>
          </div>
          {typeof stores.layoutStore.sidebarShown === 'boolean' && (
            <div
              className="llmbox-container"
              style={{
                width: stores.layoutStore.sidebarShown ? 'var(--llmbox-width)' : '0',
                position: 'relative',
                display: stores.layoutStore.sidebarShown ? 'block' : 'none',
                overflowY: 'hidden',
                flexShrink: 0,
              }}
            >
              {dragState.isDragging && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    background: 'transparent',
                  }}
                ></div>
              )}
              <DragHandle
                type="llmbox"
                left="-2px"
                onStartDrag={handleStartDrag}
              />
              <LLMBoxFrame />
            </div>
          )}
        </div>
      </div>
      <DragIndicator
        visible={dragState.isDragging}
        x={dragState.currentX}
        height="100%"
      />
      {!panel && <UnSupport uri={props.uri} />}
    </>
  );
});

export default FilePanel;
