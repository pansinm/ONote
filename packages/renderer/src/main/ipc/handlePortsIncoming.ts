import * as monaco from 'monaco-editor';
import stores from '../stores';
import SettingStore from '../stores/SettingStore';
import portsServer from './portsServer';
import { PLANTUML_ENDPOINT } from '/@/common/constants/SettingKey';
import IPCMethod from '/@/common/ipc/IPCMethod';
import type {
  IPCGetEditorModelResponse,
  IPCGetEditorScrollPositionResponse,
  IPCInsertTextToEditorRequest,
  IPCPreviewerScrollChangedEvent,
  IPCRenderGraphvizDiagramRequest,
  IPCRenderGraphvizDiagramResponse,
  IPCRenderPlantUMLDiagramRequest,
  IPCRenderPlantUMLDiagramResponse,
} from '/@/common/ipc/types';

portsServer.handleRequest(IPCMethod.GetEditorModel, async () => {
  const uri = stores.activationStore.activeFileUri;
  if (!uri) {
    throw new Error('No file opened');
  }
  return {
    uri: stores.activationStore.activeFileUri,
    content: monaco.editor.getModel(monaco.Uri.parse(uri))?.getValue(),
    rootDirUri: stores.activationStore.rootUri,
  } as IPCGetEditorModelResponse['payload'];
});

portsServer.handleRequest(
  IPCMethod.GetEditorScrollPosition,
  async ({ uri }: { uri: string }) => {
    const editor = monaco.editor.getEditors()['0'];
    if (editor && editor.getModel()?.uri.toString() === uri) {
      return {
        uri,
        lineNumber: editor.getVisibleRanges()?.[0].startLineNumber || 0,
      } as IPCGetEditorScrollPositionResponse['payload'];
    } else {
      throw new Error('No file opened');
    }
  },
);

portsServer.handleRequest(
  IPCMethod.InsertTextToEditor,
  async (payload: IPCInsertTextToEditorRequest['payload']) => {
    const { range, text, uri } = payload;
    const model = monaco.editor
      .getModels()
      .find((model) => model.uri.toString() === uri);
    model?.applyEdits([{ range, text }]);
  },
);

portsServer.handleRequest(
  IPCMethod.RenderGraphvizDiagram,
  async (
    payload: IPCRenderGraphvizDiagramRequest['payload'],
  ): Promise<IPCRenderGraphvizDiagramResponse['payload']> => {
    const svg = await window.simmer.renderGraphviz(
      payload.code,
      payload.engine as any,
    );
    return {
      type: 'svg',
      content: svg,
    };
  },
);

portsServer.handleRequest(
  IPCMethod.RenderPlantUmlDiagram,
  async (
    payload: IPCRenderPlantUMLDiagramRequest['payload'],
  ): Promise<IPCRenderPlantUMLDiagramResponse['payload']> => {
    const content = await window.simmer.renderPlantUML(
      payload.code,
      (stores.settingStore.settings[PLANTUML_ENDPOINT] as string) ||
        'https://www.plantuml.com/plantuml',
    );
    return {
      type: 'svg',
      content,
    };
  },
);

portsServer.listenEvent(
  IPCMethod.PreviewerScrollChangedEvent,
  (port, payload: IPCPreviewerScrollChangedEvent['payload']) => {
    portsServer.broadEvent(IPCMethod.EditorScrollChangedEvent, payload, [port]);
  },
);
