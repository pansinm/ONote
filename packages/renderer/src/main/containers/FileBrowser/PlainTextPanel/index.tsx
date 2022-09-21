import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import MonacoEditor from '/@/components/MonacoEditor';
import * as monaco from 'monaco-editor';

interface PlainTextPanelProps {
  uri: string;
}

const PlainTextPanel: FC<PlainTextPanelProps> = (props) => {
  const ref = useRef<React.ElementRef<typeof MonacoEditor>>(null);

  useEffect(() => {
    const updateModel = async (uri: string) => {
      let model = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (!model) {
        const value = await window.fileService.readText(uri);
        model = monaco.editor.createModel(value, uri);
      }
      ref.current?.getInstance()?.setModel(model);
    };
    updateModel(props.uri);
  }, [props.uri]);
  return <MonacoEditor ref={ref} />;
};

export default PlainTextPanel;
