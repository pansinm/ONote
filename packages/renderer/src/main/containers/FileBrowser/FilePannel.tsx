import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import MonacoEditor from '../MonacoEditor/MonacoEditor';
import UnSupport from './UnSupport';
import { filePanelManager } from '../../frame';
import { isEquals } from '/@/common/utils/uri';
import stores from '../../stores';
import { DragIndicator, DragHandle } from '/@/components/DragBarNew';
import { useResizable } from '/@/common/hooks/useResizable';
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
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载保存的宽度设置
  useEffect(() => {
    loadSavedWidths();
  }, []);

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
                // 右侧分隔线：编辑器和预览之间
                borderRight: !showEditorOnly ? '1px solid var(--warm-border)' : 'none',
              }}
            >
              <MonacoEditor
                needLoad={/\.mdx?$/.test(props.uri)}
                uri={props.uri}
              />
              {!showEditorOnly && (
                <DragHandle
                  type="editor-preview"
                  right="-5px"
                  onStartDrag={startDrag}
                  onDoubleClick={resetWidths}
                  isDragging={dragState.isDragging && dragState.type === 'editor-preview'}
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
