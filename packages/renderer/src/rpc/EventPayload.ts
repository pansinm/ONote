export type PreviewerEventPayload = {
  'previewer.scroll.changed': { uri: string; lineNumber: number };
  'previewer.diagram.toRender': {
    lang: string;
    code: string;
    meta: any;
  };
  'previewer.getEditorScrollPosition': undefined;
  'previewer.getCurrentModel': undefined;
};

export type MainEventPayload = {
  'main.getCurrentModel:response': { uri: string; content: string };
  'main.getEditorScrollPosition:response': { uri: string; lineNumber: number };
  'main.diagram.rendered': { code: string; svg: string };
  'main.editor.contentChanged': { uri: string; content: string };
  'main.editor.modelChanged': { uri: string; content: string };
  'main.scroll.changed': { uri: string; lineNumber: number };
};
