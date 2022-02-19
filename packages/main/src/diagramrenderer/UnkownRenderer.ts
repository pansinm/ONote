import type { Diagram, IDiagramRenderer } from './types';

class UnkownRenderer implements IDiagramRenderer {
  async render(): Promise<Diagram> {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="50" viewBox="0 0 300 50" id="svgcontent" x="696" y="288"><defs></defs><g style="pointer-events:all"><title style="pointer-events:inherit">Layer 1</title><text fill="#CE7975" stroke="#000" stroke-width="0" x="53" y="36" id="svg_1" font-size="24" font-family="Noto Sans JP" text-anchor="start" xml:space="preserve" style="cursor: move;">不支持的图表类型</text></g></svg>';
    return {
      mime: 'image/svg+xml',
      base64: Buffer.from(svg).toString('base64'),
    };
  }
}

export default UnkownRenderer;
