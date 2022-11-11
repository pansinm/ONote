import { useEffect, useState } from 'react';
import editor from '../ipc/editor';
import type { IPCEditorModelChangedEvent } from '/@/common/ipc/types';

export default function useModel() {
  const [model, setModel] = useState<IPCEditorModelChangedEvent['payload']>({
    uri: '',
    content: '',
    rootDirUri: '',
  });
  useEffect(() => {
    const listener = (data: typeof model) => {
      setModel(data);
    };
    // 第一次进来时，拉取一次
    editor.getCurrentModel().then(listener);

    const dispose = editor.onModelChanged(listener);
    return () => {
      dispose();
    };
  }, []);
  return model;
}
