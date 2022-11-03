import {
  CompletionAdapter,
  DefinitionAdapter,
  DiagnosticsAdapter,
  DocumentColorAdapter,
  DocumentFormattingEditProvider,
  DocumentHighlightAdapter,
  DocumentLinkAdapter,
  DocumentRangeFormattingEditProvider,
  DocumentSymbolAdapter,
  FoldingRangeAdapter,
  HoverAdapter,
  ReferenceAdapter,
  RenameAdapter,
  SelectionRangeAdapter,
  WorkerManager,
  fromPosition,
  fromRange,
  toRange,
  toTextEdit,
} from 'monaco-editor/esm/vs/language/json/jsonMode';

export const setupMode = () => {
  // ignore
};
