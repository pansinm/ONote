import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import MonacoEditor from '../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import DragBar from '/@/components/DragBar';
import Icon from '/@/components/Icon';
import UnSupport from './UnSupport';
import { filePanelManager } from '../../frame';

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
          style={{ display: uri === previewerUri ? 'block' : 'none' }}
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
  return (
    <>
      <div
        className="fullfill"
        style={{
          display: panel ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <Flex
          justifyContent={'space-between'}
          boxShadow="#dddddd 0 6px 6px -6px"
          padding={'5px 10px'}
        >
          <div></div>
          <Flex paddingRight={10}>
            <Icon
              title="演示"
              type="play-btn-fill"
              onClick={() => window.simmer.showPreviewerWindow()}
            />
          </Flex>
        </Flex>
        <Flex position="relative" flex={1}>
          <div
            className="fill-height editor-container"
            style={{ width: 'var(--editor-width)', position: 'relative' }}
          >
            <MonacoEditor
              needLoad={/\.mdx?$/.test(props.uri)}
              uri={props.uri}
            />
            <DragBar
              onStart={() => setDragging(true)}
              onStop={(delta) => {
                setDragging(false);
                handleDrag(delta);
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: previewerUri ? 'flex' : 'none',
            }}
          >
            {' '}
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
      </div>
      {!panel && <UnSupport uri={props.uri} />}
    </>
  );
});

export default FilePanel;
