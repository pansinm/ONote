import GraphvizRenderer from './GraphvizRenderer';
import PlantumlRenderer from './PlantumlRenderer';
import type { IDiagramRenderer } from './types';
import UnkownRenderer from './UnkownRenderer';

function createRenderer(
  lang: string,
  code: string,
  options: Record<string, any> = {},
): IDiagramRenderer {
  switch (lang) {
    case 'graphviz':
      return new GraphvizRenderer(code, options);
    case 'plantuml':
      return new PlantumlRenderer('https://www.plantuml.com/plantuml', code);
    case 'sequence':
    case 'mermaid':
    case 'flow':
    default:
      return new UnkownRenderer();
  }
}

export default createRenderer;
