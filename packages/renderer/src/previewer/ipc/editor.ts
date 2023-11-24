import tunnel from './tunnel';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCEditorModelChangedEvent,
  IPCGetEditorModelResponse,
  IPCGetEditorScrollPositionResponse,
} from '/@/common/ipc/types';

export type Range = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type IEdit = { range: Range; text: string };

class EditorAdapter {
  // 滚动至
  async scrollTo(uri: string, lineNumber: number) {
    tunnel.send(IPCMethod.PreviewerScrollChangedEvent, {
      uri,
      lineNumber,
    });
  }

  // 插入文本
  async insertText(uri: string, range: Range, text: string) {
    return tunnel.call(IPCMethod.InsertTextToEditor, {
      uri,
      range,
      text,
    });
  }

  async applyEdits(uri: string, edits: IEdit[]) {
    return tunnel.call(IPCMethod.InsertTextToEditor, {
      uri,
      edits,
    });
  }

  async getCurrentModel(): Promise<IPCGetEditorModelResponse['payload']> {
    await tunnel.waitForReady();
    return tunnel.call(IPCMethod.GetEditorModel) as any;
  }

  async getScrollPosition(
    uri: string,
  ): Promise<IPCGetEditorScrollPositionResponse['payload']> {
    return tunnel.call(IPCMethod.GetEditorScrollPosition, {
      uri,
    }) as Promise<any>;
  }

  onModelChanged(
    callback: (payload: IPCEditorModelChangedEvent['payload']) => void,
  ) {
    return tunnel.on(IPCMethod.OpenedModelChangedEvent, callback);
  }

  onScrollChanged(
    callback: ({
      uri,
      lineNumber,
    }: IPCGetEditorScrollPositionResponse['payload']) => void,
  ) {
    return tunnel.on(IPCMethod.EditorScrollChangedEvent, callback);
  }
}

export default new EditorAdapter();
