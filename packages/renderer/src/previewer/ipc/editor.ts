import port from './port';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCEditorModelChangedEvent,
  IPCGetEditorModelResponse,
  IPCGetEditorScrollPositionResponse,
  IPCMessage,
} from '/@/common/ipc/types';

type Range = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

class EditorAdapter {
  // 滚动至
  async scrollTo(uri: string, lineNumber: number) {
    port.sendEvent(IPCMethod.PreviewerScrollChangedEvent, {
      uri,
      lineNumber,
    });
  }

  // 插入文本
  async insertText(uri: string, range: Range, text: string) {
    return port.sendAndWait(IPCMethod.InsertTextToEditor, { uri, range, text });
  }

  async getCurrentModel(): Promise<IPCGetEditorModelResponse['payload']> {
    return port.sendAndWait(IPCMethod.GetEditorModel);
  }

  async getScrollPosition(
    uri: string,
  ): Promise<IPCGetEditorScrollPositionResponse['payload']> {
    return port.sendAndWait(IPCMethod.GetEditorScrollPosition, { uri });
  }

  onModelChanged(
    callback: (payload: IPCEditorModelChangedEvent['payload']) => void,
  ) {
    const listener = (data: IPCMessage) => callback(data.payload);
    // void
    port.on(IPCMethod.EditorModelChanged, listener);
    return () => {
      port.off(IPCMethod.EditorModelChanged, listener);
    };
  }

  async onScrollChanged(
    callback: ({
      uri,
      lineNumber,
    }: IPCGetEditorScrollPositionResponse['payload']) => void,
  ) {
    const listener = (data: IPCMessage) => callback(data.payload);
    // void
    port.on(IPCMethod.EditorScrollChangedEvent, listener);
    return () => {
      port.off(IPCMethod.EditorScrollChangedEvent, listener);
    };
  }
}

export default new EditorAdapter();
