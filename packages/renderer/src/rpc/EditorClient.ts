import Client from './Client';
import EditorRPC from './EditorRPC';

class EditorClient extends Client {
  scrollToLine(lineNumber: number) {
    return this.call(EditorRPC.ScrollToLine, lineNumber);
  }
  getScrollLine(uri: string) {
    return this.call<number>(EditorRPC.GetScrollLine, uri);
  }
}

export default EditorClient;
