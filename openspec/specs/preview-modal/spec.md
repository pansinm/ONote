# preview-modal Specification

## Purpose
TBD - created by archiving change previewer-image-zoom. Update Purpose after archive.
## Requirements
### Requirement: 预览弹窗显示

系统 MUST 支持用户双击图片或图表时显示全屏预览弹窗。

**前提** 预览器中显示有图片、图表或 Typst 内容
**当** 用户双击该视觉内容
**那么** 系统 MUST 显示全屏预览弹窗
**并且** 弹窗中 MUST 显示该内容的放大版本

#### Scenario: 双击图片触发预览
**前提** 预览器中显示有一张图片
**当** 用户双击该图片
**那么** 系统 MUST 显示预览弹窗
**且** 弹窗中 MUST 显示该图片的放大版本

#### Scenario: 双击图表触发预览
**前提** 预览器中显示有一个 Mermaid/Diagram 图表
**当** 用户双击该图表
**那么** 系统 MUST 显示预览弹窗
**且** 弹窗中 MUST 显示该图表的 SVG 渲染结果

#### Scenario: 双击 Typst 内容触发预览
**前提** 预览器中显示有 Typst 渲染内容
**当** 用户双击该内容
**那么** 系统 MUST 显示预览弹窗
**且** 弹窗中 MUST 显示该 Typst 的渲染结果

---

### Requirement: 缩放功能

系统 MUST 支持用户通过滚轮缩放预览内容。

**前提** 预览弹窗已打开
**当** 用户在预览内容上滚动鼠标滚轮
**那么** 预览内容 MUST 根据滚动方向放大或缩小

#### Scenario: 滚轮放大
**Given** 预览弹窗已打开
**When** 用户向下滚动鼠标滚轮（在预览内容上）
**Then** 预览内容 MUST 放大
**And** 缩放步进为 10%

#### Scenario: 滚轮缩小
**Given** 预览弹窗已打开
**When** 用户向上滚动鼠标滚轮（在预览内容上）
**Then** 预览内容 MUST 缩小
**And** 缩放范围 MUST 限制在 10% - 500%

#### Scenario: 最小缩放限制
**Given** 预览内容已缩小至 10%
**When** 用户继续尝试缩小
**Then** 预览内容 MUST 保持 10% 不再缩小

#### Scenario: 最大缩放限制
**Given** 预览内容已放大至 500%
**When** 用户继续尝试放大
**Then** 预览内容 MUST 保持 500% 不再放大

---

### Requirement: 拖拽移动

系统 MUST 支持用户拖拽预览内容以查看不同区域。

**前提** 预览弹窗已打开且内容超出视口
**当** 用户按下鼠标左键并在预览内容上拖动
**那么** 预览内容 MUST 跟随鼠标移动

#### Scenario: 拖拽预览内容
**Given** 预览弹窗已打开
**When** 用户按下鼠标左键并在预览内容上拖动
**Then** 预览内容 MUST 跟随鼠标移动
**And** 背景 MUST 保持不变

#### Scenario: 拖拽边界限制
**Given** 预览内容大于弹窗视口
**When** 用户拖拽预览内容
**Then** 预览内容 MUST 不超出弹窗可视区域

---

### Requirement: 关闭预览

系统 MUST 支持用户通过多种方式关闭预览弹窗。

**前提** 预览弹窗已打开
**当** 用户执行关闭操作
**那么** 预览弹窗 MUST 关闭

#### Scenario: ESC 键关闭
**Given** 预览弹窗已打开
**When** 用户按下 ESC 键
**Then** 预览弹窗 MUST 关闭

#### Scenario: 点击遮罩关闭
**弹窗已打开Given** 预览
**When** 用户点击弹窗遮罩区域（非内容区域）
**Then** 预览弹窗 MUST 关闭

---

### Requirement: 初始显示状态

预览弹窗打开时 MUST 有合适的初始显示状态。

**前提** 预览弹窗打开
**当** 显示内容
**那么** 内容 MUST 自动缩放以适应弹窗视口
**并且** 初始位置 MUST 居中显示

#### Scenario: 初始缩放为适应屏幕
**Given** 预览弹窗打开
**When** 显示内容
**Then** 内容 MUST 自动缩放以适应弹窗视口
**And** MUST 保持内容的原始宽高比

#### Scenario: 初始位置居中
**Given** 预览弹窗打开
**When** 显示内容
**Then** 内容 MUST 居中显示在弹窗中

