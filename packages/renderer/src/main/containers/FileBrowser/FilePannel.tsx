import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import MonacoEditor from '../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import DragBar from '/@/components/DragBar';
import UnSupport from './UnSupport';
import { filePanelManager } from '../../frame';
import { isEquals, isMarkdown } from '/@/common/utils/uri';
import Toolbar from './Toolbar';
import stores from '../../stores';

function handleDrag(delta: number) {
  const editorContainerEle = document.querySelector('.editor-container')!;
  const editorWidth = parseFloat(
    getComputedStyle(editorContainerEle).getPropertyValue('width'),
  );

  const parentWidth = parseFloat(
    getComputedStyle(editorContainerEle.parentElement!).getPropertyValue(
      'width',
    ),
  );

  const root = document.documentElement;

  const finalWidth = ((editorWidth + delta) * 100) / parentWidth + '%';
  root.style.setProperty('--editor-width', finalWidth);
}

interface MarkdownResourcePanelProps {
  uri: string;
}

function Previewer({ previewerUri }: { previewerUri?: string }) {
  const [renderred, setRendered] = useState<string[]>([]);
  useEffect(() => {
    setRendered((rendered) => {
      if (previewerUri && !rendered.includes(previewerUri)) {
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
          style={{ display: isEquals(uri, previewerUri) ? 'block' : 'none' }}
          name="previewer"
          src={uri}
        />
      ))}
    </>
  );
}

const FilePanel: FC<MarkdownResourcePanelProps> = observer((props) => {
  const [dragging, setDragging] = useState(false);
  const panel = filePanelManager.getPanel(props.uri);
  const previewerUri = panel?.previewer;
  const layout = stores.layoutStore.layout;

  const editorContainerRef = useRef<HTMLDivElement>(null);

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
        <Flex position="relative" flex={1}>
          <Flex
            width={
              stores.layoutStore.sidebarShown ? 'calc(100% - 400px)' : '100%'
            }
          >
            <div
              className="fill-height editor-container"
              ref={editorContainerRef}
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                width:
                  layout === 'editor-only' ? '100%' : 'var(--editor-width)',
                position: 'relative',
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
              {layout !== 'editor-only' && (
                <DragBar
                  onStart={() => setDragging(true)}
                  onStop={(delta) => {
                    setDragging(false);
                    handleDrag(delta);
                  }}
                />
              )}
            </div>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display:
                  previewerUri && layout !== 'editor-only' ? 'flex' : 'none',
              }}
            >
              <Previewer previewerUri={previewerUri} />
              {dragging ? (
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
              ) : null}
            </div>
          </Flex>
          {typeof stores.layoutStore.sidebarShown === 'boolean' && (
            <div
              style={{
                width: 400,
                position: 'relative',
                display: stores.layoutStore.sidebarShown ? 'block' : 'none',
              }}
            >
              <iframe
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  height: '100%',
                  width: '100%',
                }}
                src={stores.layoutStore.sidebarUrl}
              />
            </div>
          )}
        </Flex>
      </div>
      {!panel && <UnSupport uri={props.uri} />}
    </>
  );
});

export default FilePanel;
