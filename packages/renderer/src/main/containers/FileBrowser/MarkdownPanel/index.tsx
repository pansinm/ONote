import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useState } from 'react';
import React from 'react';
import Previewer from './Previewer';
import MonacoEditor from '../../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import DragBar from '/@/components/DragBar';
import Icon from '/@/components/Icon';

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
  visible: boolean;
}

const MarkdownResourcePanel: FC<MarkdownResourcePanelProps> = observer(
  (props) => {
    const [dragging, setDragging] = useState(false);
    return (
      <div
        className="fullfill"
        style={{
          display: props.visible ? 'flex' : 'none',
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
              title="布局"
              type="layout-text-window-reverse"
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
          <div style={{ flex: 1, position: 'relative' }}>
            <Previewer />
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
    );
  },
);

export default MarkdownResourcePanel;
