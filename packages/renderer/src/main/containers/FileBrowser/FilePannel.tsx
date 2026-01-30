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
import { useResizable, DragType } from '/@/common/hooks/useResizable';
import { resetWidths, loadSavedWidths } from '/@/common/constants/resize';
import { RESIZE_CONFIG } from '/@/common/constants/resize';

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
          style={{
            display: isEquals(uri, previewerUri) ? 'block' : 'none',
            zIndex: 1,
          }}
          name="previewer"
          src={uri}
        />
      ))}
    </>
  );
}

const FilePanel: FC<MarkdownResourcePanelProps> = observer((props) => {
  const panel = filePanelManager.getPanel(props.uri);
  const previewerUri = panel?.previewer;
  const layout = stores.layoutStore.layout;

  const showEditorOnly = layout === 'editor-only' || !previewerUri;
  const showPreviewerOnly = layout === 'previewer-only';
  const showSidebar = typeof stores.layoutStore.sidebarShown === 'boolean';
  const showBothEditorAndPreview = !showEditorOnly && !showPreviewerOnly;
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载保存的宽度设置
  useEffect(() => {
    loadSavedWidths();
  }, []);

  const containerWidth = showSidebar
    ? 'calc(100% - var(--llmbox-width))'
    : '100%';

  // 使用自定义 Hook 处理拖拽
  const { dragState, startDrag } = useResizable({ containerRef });

  const editorWidth = showEditorOnly ? '100%' : 'var(--editor-width)';

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
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              width: containerWidth,
            }}
          >
            <div
              className="fill-height editor-container"
              ref={editorContainerRef}
              style={{
                maxWidth: '100%',
                width: editorWidth,
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1000,
                display:
                  panel?.editable && layout !== 'previewer-only'
                    ? 'flex'
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
                  onStartDrag={startDrag}
                  onDoubleClick={resetWidths}
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
            {showSidebar && (
              <div
                className="llmbox-container"
                style={{
                  minWidth: stores.layoutStore.sidebarShown
                    ? 'var(--llmbox-width)'
                    : '0',
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
                  onStartDrag={(type, startX) =>
                    startDrag(
                      type,
                      startX,
                      showEditorOnly
                        ? {
                            cssVar: RESIZE_CONFIG.editor.cssVar,
                            min: RESIZE_CONFIG.editor.min,
                            max: RESIZE_CONFIG.editor.max,
                          }
                        : undefined,
                    )
                  }
                  onDoubleClick={resetWidths}
                />
                <LLMBoxFrame />
              </div>
            )}
          </div>
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
