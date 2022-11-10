import port from './port';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type { IPCGetEditorModelResponse } from '/@/common/ipc/types';

type Range = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

class EditorAdapter {
  // 滚动至
  async scrollTo(lineNumber: number) {
    // todo
  }

  // 插入文本
  async insertText(range: Range, text: string) {
    // todo
  }

  async getCurrentModel(): Promise<IPCGetEditorModelResponse['payload']> {
    return port.sendAndWait(IPCMethod.GetEditorModel);
  }

  async getScrollPosition() {
    // todo
  }

  async onScrollChanged(callback: () => void) {
    // void
    port.on('editor.scrolled', callback);
    return () => {
      port.off('editor.scrolled', callback);
    };
  }
}

export default new EditorAdapter();
