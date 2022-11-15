import port from './port';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCRenderGraphvizDiagramResponse,
  IPCRenderGraphvizDiagramRequest,
  IPCRenderPlantUMLDiagramResponse,
} from '/@/common/ipc/types';
import { IPCGetEditorModelRequest } from '/@/common/ipc/types';

class DiagramRenderer {
  renderGrapviz(code: string, engine: string) {
    return port.sendAndWait(IPCMethod.RenderGraphvizDiagram, {
      code,
      engine,
    } as IPCRenderGraphvizDiagramRequest['payload']) as Promise<
      IPCRenderGraphvizDiagramResponse['payload']
    >;
  }

  renderPlantUML(
    code: string,
  ): Promise<IPCRenderPlantUMLDiagramResponse['payload']> {
    return port.sendAndWait(IPCMethod.RenderPlantUmlDiagram, { code });
  }
}

export default new DiagramRenderer();
