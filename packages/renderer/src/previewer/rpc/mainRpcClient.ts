import type { Range } from 'monaco-editor';
import type { Engine } from '@hpcc-js/wasm';
import Client from '../../rpc/Client';

class RPCClient extends Client {
  renderGraphviz(dot: string, engine: Engine): Promise<string> {
    return this.call('renderGraphviz', dot, engine) as Promise<string>;
  }
  renderPlantUML(uml: string) {
    return this.call('renderPlantUML', uml) as Promise<string>;
  }
  copyImage(content: any, type: 'dataURL' | 'ArrayBuffer') {
    return this.call('copyImage', content, type) as Promise<void>;
  }
  replaceText(
    uri: string,
    range: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    },
    text: string,
  ) {
    return this.call('replaceText', uri, range, text) as Promise<void>;
  }
}

export default new RPCClient(window.parent);
