# 规范: 选中文本同步与清空

## ADDED Requirements

### Requirement: Previewer 选中文本取消检测

系统 MUST 检测 Previewer 中选中文本被清空的情况，并更新 LLMBox 状态。

**前提** 用户在 Previewer 中选中了文本（LLMBox 显示选中状态）
**当** 用户点击 Previewer 的空白区域，或执行导致选中取消的操作（例如点击编辑器）
**那么** Previewer 必须检测到选中的折叠
**并且** 必须发送 `IPCMethod.PreviewerSelectionChangedEvent`，内容为 `content: ''`
**并且** LLMBox 必须更新其状态以从显示中移除选中。

#### Scenario: 点击空白区域自动清空选中
**前提** 用户在 Previewer 中选中了文本（LLMBox 显示选中状态）
**当** 用户点击 Previewer 的空白区域，或执行导致选中取消的操作（例如点击编辑器）
**那么** Previewer 必须检测到选中的折叠
**并且** 必须发送 `IPCMethod.PreviewerSelectionChangedEvent`，内容为 `content: ''`
**并且** LLMBox 必须更新其状态以从显示中移除选中。

### Requirement: 手动清空选中

LLMBox UI MUST 为用户提供手动关闭选中文本区域的功能。

**前提** LLMBox 正在显示一个选中的文本片段
**当** 用户点击选中区域头部的 "X"（关闭）按钮
**那么** LLMBox UI 必须隐藏选中文本容器
**并且** 必须向主框架发送消息以清空选中状态（如果共享）
**并且** 内部的 `Store.selection` 必须设置为空字符串。

#### Scenario: LLMBox 中的关闭按钮
**前提** LLMBox 正在显示一个选中的文本片段
**当** 用户点击选中区域头部的 "X"（关闭）按钮
**那么** LLMBox UI 必须隐藏选中文本容器
**并且** 必须向主框架发送消息以清空选中状态（如果共享）
**并且** 内部的 `Store.selection` 必须设置为空字符串。
