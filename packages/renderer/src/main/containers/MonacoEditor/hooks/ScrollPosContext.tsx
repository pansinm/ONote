import type { FC } from 'react';
import { useContext } from 'react';
import React from 'react';
import type * as monaco from 'monaco-editor';
import useEditorScrollPos from './useEditorScrollPosRef';

export const ScrollPosContext = React.createContext(
  React.createRef<Record<string, { lineNumber: number; scrollTop: number }>>(),
);

export const ScrollPosProvider: FC<{
  editor?: monaco.editor.IStandaloneCodeEditor;
  children: React.ReactNode;
}> = ({ children, editor }) => {
  const posRef = useEditorScrollPos(editor);
  return (
    <ScrollPosContext.Provider value={posRef}>
      {children}
    </ScrollPosContext.Provider>
  );
};

export const useScrollPosContext = () => {
  return useContext(ScrollPosContext);
};
