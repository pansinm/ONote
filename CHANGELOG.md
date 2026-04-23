# Changelog

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
