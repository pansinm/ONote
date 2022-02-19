import type { Engine } from '@hpcc-js/wasm';
import { graphviz } from '@hpcc-js/wasm';
import type { IDiagramRenderer, Diagram } from './types';

class GraphvizRenderer implements IDiagramRenderer {
  dot: string;
  engine: Engine;
  constructor(code: string, options: Record<string, any>) {
    this.dot = code;
    this.engine = options.engine || 'dot';
  }
  async render(): Promise<Diagram> {
    const svg = await graphviz.layout(this.dot, 'svg', this.engine);
    return {
      mime: 'image/svg+xml',
      base64: Buffer.from(svg).toString('base64'),
    };
  }
}

export default GraphvizRenderer;
