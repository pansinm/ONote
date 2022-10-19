export type PreviewerEventPayload = {
  'previewer.scroll.changed': {
    uri: string;
    lineNumber: number;
    inIframe: boolean;
  };
  'previewer.diagram.toRender': {
    taskId: string;
    lang: string;
    code: string;
    meta: any;
  };
  'previewer.getEditorScrollPosition': undefined;
  'previewer.getCurrentModel': undefined;
  'previewer.replaceText': {
    uri: string;
    range: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
    text: string;
  };
};

export type MainEventPayload = {
  'main.getCurrentModel:response': { uri: string; content: string };
  'main.getEditorScrollPosition:response': { uri: string; lineNumber: number };
  'main.diagram.rendered':
    | { taskId: string; svg: string }
    | { taskId: string; err: unknown };
  'main.editor.contentChanged': { uri: string; content: string };
  'main.editor.modelChanged': { uri: string; content: string };
  'main.scroll.changed': { uri: string; lineNumber: number };
};
