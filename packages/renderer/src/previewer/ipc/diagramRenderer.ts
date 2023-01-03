import tunnel from './tunnel';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCRenderGraphvizDiagramResponse,
  IPCRenderGraphvizDiagramRequest,
  IPCRenderPlantUMLDiagramResponse,
} from '/@/common/ipc/types';

class DiagramRenderer {
  renderGrapviz(code: string, engine: string) {
    return tunnel.call(IPCMethod.RenderGraphvizDiagram, {
      code,
      engine,
    } as IPCRenderGraphvizDiagramRequest['payload']) as Promise<
      IPCRenderGraphvizDiagramResponse['payload']
    >;
  }

  renderPlantUML(
    code: string,
  ): Promise<IPCRenderPlantUMLDiagramResponse['payload']> {
    return tunnel.call(IPCMethod.RenderPlantUmlDiagram, { code }) as any;
  }
}

export default new DiagramRenderer();
