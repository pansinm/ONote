import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Previewer from './Previewer';
import MonacoEditor from '../../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import { DragHandle } from '/@/components/DragBarNew';
import { PlayRegular } from '@fluentui/react-icons';

interface MarkdownResourcePanelProps {
  uri: string;
  visible: boolean;
}

const MarkdownResourcePanel: FC<MarkdownResourcePanelProps> = observer(
  (props) => {
    const { t } = useTranslation('common');
    const [isDragging, setIsDragging] = useState(false);
    const beforeXRef = useRef(0);

    const handleStartDrag = useCallback((_type: unknown, startX: number) => {
      beforeXRef.current = startX;
      setIsDragging(true);
    }, []);

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - beforeXRef.current;
        beforeXRef.current = e.clientX;
        const editorContainerEle = document.querySelector('.editor-container')!;
        const editorWidth = parseFloat(
          getComputedStyle(editorContainerEle).getPropertyValue('width'),
        );
        const parentWidth = parseFloat(
          getComputedStyle(editorContainerEle.parentElement!).getPropertyValue('width'),
        );
        const finalWidth = ((editorWidth + delta) * 100) / parentWidth + '%';
        document.documentElement.style.setProperty('--editor-width', finalWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

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
            <PlayRegular
              title={t('demo')}
              style={{ fontSize: 18, cursor: 'pointer', color: '#5c5545' }}
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
            <DragHandle
              right="0"
              onStartDrag={handleStartDrag}
              isDragging={isDragging}
            />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Previewer />
            {isDragging ? (
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
