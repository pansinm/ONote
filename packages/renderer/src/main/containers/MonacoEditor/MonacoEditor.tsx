import { observer, useObserver } from 'mobx-react-lite';
import type * as monaco from 'monaco-editor';
import type { FC } from 'react';
import React from 'react';
import useEditor from './hooks/useEditor';
import useEditorScrollRecover from './hooks/useEditorScrollRecover';
import useMarkdownExtensions from './hooks/useMarkdownExtensions';
import useLayout from './hooks/useLayout';
import usePreviewerRPC from './hooks/usePreviewerRPC';
import useModel from './hooks/useModel';
import useModelContentChange from './hooks/useModelContentChange';
import useVim from './hooks/useVim';
import Flex from '/@/components/Flex';
import stores from '../../stores';
import { EDITOR_MODE } from '/@/common/constants/SettingKey';
import { ScrollPosProvider } from './hooks/ScrollPosContext';
import EditorConfig from './EditorConfig';

export type EditorRef = {
  getInstance: () => monaco.editor.IStandaloneCodeEditor | undefined;
};

interface MonacoEditorProps {
  uri: string;
  needLoad?: boolean;
  onScroll?(): void;
  onModelChange?(fromUri: string, toUri: string): void;
  onContentChange?(uri: string): void;
}

const MonacoEditor: FC<MonacoEditorProps> = function Editor(props) {
  const { editor, containerRef } = useEditor();

  // 重新调整大小
  useLayout(editor, containerRef.current);
  const editorMode = stores.settingStore.settings[EDITOR_MODE];

  return (
    <ScrollPosProvider editor={editor}>
      <EditorConfig uri={props.uri} editor={editor} />
      <Flex flexDirection="column" className="fullfill" position="relative">
        <div
          style={{
            width: '100%',
            height: editorMode === 'VIM_MODE' ? 'calc(100% - 21px)' : '100%',
          }}
          ref={containerRef}
        />
        <div
          id="vim-status-bar"
          style={{
            height: '20px',
            display: editorMode === 'VIM_MODE' ? 'block' : 'none',
          }}
        ></div>
      </Flex>
    </ScrollPosProvider>
  );
};

export default observer(MonacoEditor);
