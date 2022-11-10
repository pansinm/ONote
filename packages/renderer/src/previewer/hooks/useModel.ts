import { useEffect, useState } from 'react';
import editor from '../ipc/editor';
import mainService from '../services/mainService';

export default function useModel() {
  const [model, setModel] = useState({ uri: '', content: '', rootDirUri: '' });
  useEffect(() => {
    const listener = (data: typeof model) => {
      setModel(data);
    };
    // 第一次进来时，拉取一次
    editor.getCurrentModel().then(listener);

    mainService.on('main.editor.modelChanged', listener);
    mainService.on('main.editor.contentChanged', listener);
    return () => {
      mainService.off('main.editor.contentChanged', listener);
      mainService.off('main.editor.modelChanged', listener);
    };
  }, []);
  return model;
}
