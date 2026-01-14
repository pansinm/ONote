import mainFrame from '../../frame/mainFrame';
import * as monaco from 'monaco-editor';

import {
  PLANTUML_ENDPOINT,
  PLANTUML_USECACHE,
} from '/@/common/constants/SettingKey';
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
import { isEquals } from '/@/common/utils/uri';
import stores from '../../stores';
import state from './state';
import { applyModelEdits } from '../../monaco/utils';
import eventbus from '../../eventbus/eventbus';
import { EDITOR_SELECTION_CHANGED } from '../../eventbus/EventName';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('PreviewerTunnel');

mainFrame.onNewTunnel((tunnel) => {
  if (tunnel.groupId !== 'previewer') {
    return;
  }
  tunnel.handle(IPCMethod.GetEditorModel, async () => {
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

  tunnel.handle(
    IPCMethod.GetEditorScrollPosition,
    async ({ uri }: { uri: string }) => {
      const editor = monaco.editor.getEditors()['0'];
      if (editor && isEquals(editor.getModel()?.uri.toString(), uri)) {
        return {
          uri,
          lineNumber: editor.getVisibleRanges()?.[0].startLineNumber || 0,
        } as IPCGetEditorScrollPositionResponse['payload'];
      } else {
        throw new Error('No file opened');
      }
    },
  );

  let timeout: ReturnType<typeof setTimeout>;

  const handlePreviewerScrollChanged = ({
    uri,
    lineNumber,
  }: {
    uri: string;
    lineNumber: number;
    inIframe: boolean;
  }) => {
    const editor = monaco.editor.getEditors()[0];
    if (!isEquals(uri, editor?.getModel()?.uri.toString())) {
      return;
    }
    clearTimeout(timeout);
    state.PREVIEWER_SCROLLING = true;
    editor?.setScrollTop(editor?.getTopForLineNumber(lineNumber));
    timeout = setTimeout(() => {
      state.PREVIEWER_SCROLLING = false;
    }, 300);
  };

  tunnel.on(
    IPCMethod.PreviewerScrollChangedEvent,
    handlePreviewerScrollChanged,
  );

  tunnel.handle(
    IPCMethod.InsertTextToEditor,
    async (payload: IPCInsertTextToEditorRequest['payload']) => {
      const { range, text = '', uri, edits } = payload;
      const model = monaco.editor
        .getModels()
        .find((model) => isEquals(model.uri.toString(), uri));
      if (!model) {
        return;
      }
      if (edits) {
        applyModelEdits(model, edits);
      } else if (range) {
        applyModelEdits(model, [{ range, text }]);
      }
    },
  );

  tunnel.handle(
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

  tunnel.handle(
    IPCMethod.RenderPlantUmlDiagram,
    async (
      payload: IPCRenderPlantUMLDiagramRequest['payload'],
    ): Promise<IPCRenderPlantUMLDiagramResponse['payload']> => {
      const content = await window.simmer.renderPlantUML(
        payload.code,
        (stores.settingStore.settings[PLANTUML_ENDPOINT] as string) ||
          'https://www.plantuml.com/plantuml',
        !!stores.settingStore.settings[PLANTUML_USECACHE],
      );
      return {
        type: 'svg',
        content,
      };
    },
  );

  tunnel.handle(IPCMethod.RenderTysp, async (payload) => {
    const { uri, content, type } = payload;
    return window.onote.typst.invoke('compile', uri, content, type);
  });

  tunnel.on(
    IPCMethod.PreviewerScrollChangedEvent,
    (payload: IPCPreviewerScrollChangedEvent['payload']) => {
      mainFrame
        .findTunnels((t) => t.clientId !== tunnel.clientId)
        .forEach((t) => {
          t.send(IPCMethod.EditorScrollChangedEvent, payload);
        });
    },
  );

  // 监听 previewer 中的文本选择事件，并转发到事件总线
  tunnel.on(
    IPCMethod.PreviewerSelectionChangedEvent,
    (payload: { content: string }) => {
      const uri = stores.activationStore.activeFileUri;
      const editor = monaco.editor.getEditors()[0];
      const fileContent = editor?.getValue() || '';

      logger.info('Received selection from previewer', {
        selectionLength: payload.content.length,
        uri,
      });

      eventbus.emit(EDITOR_SELECTION_CHANGED, {
        uri,
        content: fileContent,
        selection: payload.content,
      });
    },
  );
});
