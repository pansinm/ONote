import { useObserver } from 'mobx-react-lite';
import type * as monaco from 'monaco-editor';
import { useEffect } from 'react';
import { EDITOR_MODE } from '/@/common/constants/SettingKey';
import stores from '/@/main/stores';
import { initVimMode, VimMode } from 'monaco-vim';

VimMode.Vim.defineEx(
  'write',
  'w',
  function ({ editor }: { editor: monaco.editor.IStandaloneCodeEditor }) {
    // your own implementation on what you want to do when :w is pressed
    const model = editor.getModel();
    if (model) {
      stores.fileStore.save(model.uri.toString());
    }
  },
);

VimMode.Vim.defineEx(
  'quit',
  'q',
  function ({ editor }: { editor: monaco.editor.IStandaloneCodeEditor }) {
    // your own implementation on what you want to do when :w is pressed
    const model = editor.getModel();
    if (model) {
      const uri = model.uri.toString();
      stores.activationStore.closeFile(uri);
    }
  },
);

VimMode.Vim.defineEx(
  'xquit',
  'x',
  function ({ editor }: { editor: monaco.editor.IStandaloneCodeEditor }) {
    // your own implementation on what you want to do when :w is pressed
    const model = editor.getModel();
    if (model) {
      const uri = model.uri.toString();
      stores.activationStore.closeFile(uri);
    }
  },
);

function useVim(editor?: monaco.editor.IStandaloneCodeEditor) {
  const settings = useObserver(() => stores.settingStore.settings);
  const editorMode = settings[EDITOR_MODE];
  useEffect(() => {
    let vimMode: { dispose(): void } | undefined;
    if (editor && editorMode === 'VIM_MODE') {
      vimMode = initVimMode(editor, document.querySelector('#vim-status-bar'));
      // editor.layout();
    }
    return () => {
      vimMode?.dispose();
    };
  }, [editor, editorMode]);
}

export default useVim;
