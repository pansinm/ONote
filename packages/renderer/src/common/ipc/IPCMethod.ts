enum IPCMethod {
  /**
   * 获取编辑器当前内容
   */
  GetEditorModel = 'GetEditorModel',

  /**
   * 编辑器内容变化
   */
  EditorModelChanged = 'EditorModelChanged',

  /**
   * 插入文本
   */
  InsertTextToEditor = 'EditorInsertTextToEditor',

  /**
   * 获取编辑器滚动条位置
   */
  GetEditorScrollPosition = 'GetEditorScrollPosition',

  /**
   * 编辑器滚动条位置变化
   */
  EditorScrollChangedEvent = 'EditorScrollChanged',

  /**
   * 渲染 PlantUML
   */
  RenderPlantUmlDiagram = 'RenderPlantUmlDiagram',
}

export default IPCMethod;
