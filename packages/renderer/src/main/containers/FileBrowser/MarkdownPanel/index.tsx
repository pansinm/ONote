import * as monaco from 'monaco-editor';
import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import React from 'react';
import type { PreviewerRef } from './Previewer';
import Previewer from './Previewer';
import type { EditorRef } from '/@/components/MonacoEditor';
import MonacoEditor from '/@/components/MonacoEditor';
import stores from '../../../stores';
import useEditorScrollSync from '/@/hooks/useEditorScrollSync';
import useForceUpdate from '/@/hooks/useForceUpdate';
import Flex from '/@/components/Flex';
import DragBar from '/@/components/DragBar';

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
    const editorRef = useRef<EditorRef>(null);
    const previewerRef = useRef<PreviewerRef>(null);
    const forceUpdate = useForceUpdate();

    const openedFiles = stores.activationStore.openedFiles;
    useEffect(() => {
      const models = monaco.editor.getModels();
      models.forEach((model) => {
        const opened = openedFiles.find(
          (resource) => resource === model.uri.toString(),
        );
        if (!opened) {
          // 关闭后自动保存
          if (model.getVersionId()) {
            window.fileService.writeText(
              model.uri.toString(),
              model.getValue(),
            );
          }
          model.dispose();
        }
      });
    }, [openedFiles]);

    useEditorScrollSync(
      editorRef.current?.getInstance(),
      previewerRef.current?.getWindow(),
    );
    useEffect(() => {
      const editor = editorRef.current?.getInstance();
      if (!editor) {
        return;
      }
      const renderMarkdown = (model: monaco.editor.IModel) => {
        previewerRef.current
          ?.getRPCClient()
          .call('renderMarkdown', model?.uri.toString(), model?.getValue());
      };

      previewerRef.current?.getWindow().addEventListener('load', () => {
        if (editor) {
          renderMarkdown(editor!.getModel()!);
        }
        forceUpdate();
      });

      const modelChangeDisposer = editor.onDidChangeModel((e) => {
        const newUrl = e.newModelUrl;
        if (newUrl) {
          renderMarkdown(monaco.editor.getModel(newUrl)!);
        }
      });
      const modelContentDisposer = editor.onDidChangeModelContent((ev) => {
        const model = editor.getModel();
        if (model) {
          renderMarkdown(model);
          stores.activationStore.setEditState(model.uri.toString(), 'editing');
        }
      });

      return () => {
        modelContentDisposer?.dispose();
        modelChangeDisposer?.dispose();
      };
    }, []);

    const [dragging, setDragging] = useState(false);
    return (
      <div
        className="fullfill"
        style={{
          display: props.visible ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <Flex position="relative" flex={1}>
          <div
            className="fill-height editor-container"
            style={{ width: 'var(--editor-width)', position: 'relative' }}
          >
            <MonacoEditor
              needLoad={/\.mdx?$/.test(props.uri)}
              uri={props.uri}
              ref={editorRef}
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
            <Previewer ref={previewerRef} />
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
