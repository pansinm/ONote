enum IPCMethod {
  /**
   * 获取编辑器当前内容
   */
  GetEditorModel = 'GetEditorModel',

  /**
   * 编辑器内容变化
   */
  OpenedModelChangedEvent = 'OpenedModelChangedEvent',

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
  EditorScrollChangedEvent = 'EditorScrollChangedEvent',
  /**
   * 预览页面滚动条变化
   */
  PreviewerScrollChangedEvent = 'PreviewerScrollChangedEvent ',

  /**
   * 渲染 PlantUML
   */
  RenderPlantUmlDiagram = 'RenderPlantUmlDiagram',
  RenderGraphvizDiagram = 'RenderGraphvizDiagram',
  RenderTysp = 'RenderTysp',
}

export default IPCMethod;
