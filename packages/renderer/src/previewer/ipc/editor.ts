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
    return port.sendRequestAndWait(IPCMethod.InsertTextToEditor, {
      uri,
      range,
      text,
    });
  }

  async getCurrentModel(): Promise<IPCGetEditorModelResponse['payload']> {
    return port.sendRequestAndWait(IPCMethod.GetEditorModel);
  }

  async getScrollPosition(
    uri: string,
  ): Promise<IPCGetEditorScrollPositionResponse['payload']> {
    return port.sendRequestAndWait(IPCMethod.GetEditorScrollPosition, { uri });
  }

  onModelChanged(
    callback: (payload: IPCEditorModelChangedEvent['payload']) => void,
  ) {
    return port.handleEvent(IPCMethod.OpenedModelChangedEvent, callback);
  }

  onScrollChanged(
    callback: ({
      uri,
      lineNumber,
    }: IPCGetEditorScrollPositionResponse['payload']) => void,
  ) {
    return port.handleEvent(IPCMethod.EditorScrollChangedEvent, callback);
  }
}

export default new EditorAdapter();
