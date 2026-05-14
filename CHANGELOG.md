# Changelog

## v0.16.1 (2026-05-14)

### 修复
- Markdown 编辑器语法高亮失效：`monaco-markdown` 的 monarch tokenizer 注册在 `markdown-math` 语言 ID 上，但编辑器和 model 绑定使用的是 Monaco 内置的 `markdown`，导致 tokenizer 从未生效。统一所有入口使用 `markdown-math`。

### 改进
- 编辑器与预览区字体统一：编辑器默认字体大小从 14px 调整为 16px，预览区 `.markdown-body` 的 font-family 和 font-size 改为从 body 继承，line-height 从 1.7 调整为 1.5，两侧排版参数一致。

---

## v0.16.0 (2026-04-24)

### 改进
- Fluent UI 去耦进入 Phase 2：收束基础样式层，统一 focus ring、icon button 和暖色 CSS 变量
- 修正全局焦点策略，不再使用会吞掉键盘焦点可见性的 `outline: 0`
- Sidebar / Search results / Toolbar / ContentPanel 统一复用 SCSS Modules + CSS variables + SCSS mixins
- Toolbar 二维码弹层补齐 `Escape` 关闭，并将样式从 inline style 抽离
- `UnSupport` 提示态去除 Fluent Button / View，改为 ONote 自有按钮表达，和空状态视觉语言统一
- 迁移评估文档补齐 Phase 2 边界、验收标准和后续禁区说明

### 修复
- 键盘导航下焦点态可能丢失的问题
- 不支持文件格式提示态像临时拼装页的问题

---

## v0.15.0 (2025-04-23)

### 新功能
- MCP Server Phase 3：外部操作（MCP/REST API）→ 前端文件树实时同步
- REST API 和 CLI 支持
- "纸与墨"暖色设计系统：FluentProvider warm theme + 暖色阶色板全面替换冷色
- Sidebar 合并为统一面板（230px），搜索重构 + 视觉统一
- Toolbar 合并进 Tab 栏，图标统一为 Fluent UI Icons
- 文件创建流程优化：自动展开父目录、创建后立即激活
- 应用图标系统简化

### 改进
- 文件树拖拽防误操作：禁止将目录移入自身或子目录
- LLMBox 欢迎页、语法高亮、快捷键、拖拽提示、设置面板 UX 打磨
- 彻底移除所有 AI/LLM 相关组件（代码清理）
- 清理 Vite 迁移残留：统一 Webpack 构建注释和命名
- FileTreeItem 添加 active 高亮状态
- 工具栏 Tooltip 统一为 Fluent Tooltip 组件
- "打开目录"按钮降级为图标按钮，释放视觉注意力

### 修复
- 选择目录后弹窗不关闭
- ContentPanel flex 布局 + Tab 栏背景色
- 移除 Settings 中过度激进的 ESC 捕获和退出按钮
- Sidebar 合并后文件激活高亮丢失
- 文件树外部变更刷新性能优化（防抖合并）

---

## v0.9.0
(历史版本，未记录)
