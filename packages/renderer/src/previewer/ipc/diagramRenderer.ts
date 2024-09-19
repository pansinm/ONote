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

  renderTysp(uri: string, content: string, type: string) {
    return tunnel.call(IPCMethod.RenderTysp, {
      uri,
      content,
      type,
    }) as Promise<string>;
  }
}

export default new DiagramRenderer();
