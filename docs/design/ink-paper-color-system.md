# ONote 墨与纸色彩体系设计文档

> 基于 Logo 设计语言，建立统一的亮色/暗色双主题色彩系统。

## 1. Logo 提取

| 元素 | 色值 | 语义 |
|------|------|------|
| 背景（亮端） | `#1F2B3A` | 墨色 |
| 背景（暗端） | `#0E1620` | 深墨 |
| 图形（亮端） | `#FFF8EE` | 暖纸白 |
| 图形（暗端） | `#E7D4B6` | 羊皮纸 |

**核心隐喻：深色墨底上铺着一张暖纸。** 编辑器 UI 用纸色做内容底、墨色做强调——logo 和界面是一家人。

## 2. 设计原则

1. **从 Logo 来** — 所有颜色从 logo 的墨色/纸色衍生，不引入无关色系。
2. **纸色做底，墨色做笔** — 亮色主题：纸色背景 + 墨色文字/强调；暗色主题：墨色背景 + 纸色文字/强调。
3. **语义变量隔离** — 组件只依赖 `--bg-*`/`--text-*`/`--border-*` 等语义变量，不直接引用色阶。换肤只改一层。
4. **5 档明度拉开** — Surface 层 5 档明度差，Tab 栏 > Sidebar > 内容区层级清晰可辨。

## 3. 亮色主题 (Light)

### 3.1 纸色阶 (Surface)

```
--paper-50:  #FFFCF5;   ← 内容区（最亮）
--paper-100: #FFF8EE;   ← 卡片/弹窗（logo 暖纸亮端）
--paper-200: #F5EDE0;   ← Sidebar
--paper-300: #EDE3D4;   ← Tab 栏
--paper-400: #E7D4B6;   ← 选中态（logo 暖纸暗端）
--paper-500: #D4C4A6;   ← 按压态
```

### 3.2 墨色阶 (Text / Brand)

```
--ink-900: #0E1620;     ← 最深（logo 深墨端）
--ink-800: #1F2B3A;     ← 品牌色（logo 墨色亮端）
--ink-700: #2C3E52;     ← 标题
--ink-600: #3D5168;     ← 正文
--ink-500: #556B7E;     ← 次要文字
--ink-400: #7A8E9F;     ← 提示/辅助
--ink-300: #9FB0BD;     ← 占位符/禁用
--ink-200: #C2CDD6;     ← 浅边框
--ink-100: #E0E7ED;     ← 分割线/最浅边框
```

### 3.3 强调色

```
--accent:         #1F2B3A;   ← 主按钮、选中 tab、checkbox
--accent-hover:   #2C3E52;
--accent-pressed: #0E1620;
--accent-text:    #FFFFFF;
```

### 3.4 语义映射

```scss
// ── 背景 ──
--bg-content:  var(--paper-50);     // 编辑区、预览区
--bg-card:     var(--paper-100);    // 弹窗、浮层
--bg-sidebar:  var(--paper-200);    // 侧边栏
--bg-tabbar:   var(--paper-300);    // Tab 栏
--bg-active:   var(--paper-400);    // 选中项底色
--bg-hover:    rgba(31, 43, 58, 0.05);
--bg-pressed:  rgba(31, 43, 58, 0.08);

// ── 文字 ──
--text-heading:    var(--ink-700);
--text-body:       var(--ink-600);
--text-secondary:  var(--ink-500);
--text-hint:       var(--ink-400);
--text-disabled:   var(--ink-300);
--text-on-accent:  #FFFFFF;

// ── 边框 ──
--border:       var(--ink-200);
--border-light: var(--ink-100);

// ── 搜索高亮 ──
--highlight-bg:   #F6D98D;
--highlight-text: var(--ink-900);

// ── 功能色 ──
--success: #3A7D44;
--warning: #B8860B;
--error:   #A83232;
--info:    #2C6B8A;

// ── 空/占位图标 ──
--icon-empty: #C2CDD6;
--icon-muted: var(--ink-400);
```

## 4. 暗色主题 (Dark)

### 4.1 Surface（墨色阶反转为底）

```
--paper-50:  #0E1620;   ← 内容区（最深）
--paper-100: #141E2C;   ← 卡片/弹窗
--paper-200: #1A2535;   ← Sidebar
--paper-300: #1F2B3A;   ← Tab 栏（= logo 墨色亮端）
--paper-400: #2C3E52;   ← 选中态
--paper-500: #3D5168;   ← 按压态
```

### 4.2 Text（纸色阶反转为字）

```
--ink-900: #FFFCF5;     ← 最亮（= 亮色 paper-50）
--ink-800: #FFF8EE;     ← 标题（= logo 暖纸亮端）
--ink-700: #F0E6D6;     ← 标题
--ink-600: #D4C4A6;     ← 正文（= logo 暖纸暗端）
--ink-500: #B0A08F;     ← 次要文字
--ink-400: #8A8886;     ← 提示/辅助
--ink-300: #5C5545;     ← 占位符/禁用
--ink-200: #3A3228;     ← 浅边框
--ink-100: #2A2420;     ← 分割线
```

### 4.3 强调色（暗色主题用纸色强调）

```
--accent:         #E7D4B6;   ← logo 暖纸暗端
--accent-hover:   #F0E6D6;
--accent-pressed: #D4C4A6;
--accent-text:    #0E1620;   ← 深墨色文字
```

### 4.4 语义映射

```scss
// ── 背景 ──
--bg-content:  var(--paper-50);
--bg-card:     var(--paper-100);
--bg-sidebar:  var(--paper-200);
--bg-tabbar:   var(--paper-300);
--bg-active:   var(--paper-400);
--bg-hover:    rgba(231, 212, 182, 0.06);
--bg-pressed:  rgba(231, 212, 182, 0.10);

// ── 文字 ──
--text-heading:    var(--ink-700);
--text-body:       var(--ink-600);
--text-secondary:  var(--ink-500);
--text-hint:       var(--ink-400);
--text-disabled:   var(--ink-300);
--text-on-accent:  #0E1620;

// ── 边框 ──
--border:       var(--ink-200);
--border-light: var(--ink-100);

// ── 搜索高亮 ──
--highlight-bg:   rgba(246, 217, 141, 0.20);
--highlight-text: #F6D98D;

// ── 功能色（暗色主题适当提亮）──
--success: #52B765;
--warning: #D4A017;
--error:   #E05555;
--info:    #5BA3C9;

// ── 空/占位图标 ──
--icon-empty: #3D5168;
--icon-muted: var(--ink-400);
```

## 5. 主题切换机制

### 5.1 CSS 切换方式

通过 `<html data-theme="light|dark">` 属性切换，`:root` 定义亮色，`[data-theme="dark"]` 覆盖暗色。

```scss
:root {
  // 亮色变量...
  color-scheme: light;
}

[data-theme="dark"] {
  // 暗色变量覆盖...
  color-scheme: dark;
}
```

### 5.2 默认跟随系统

```scss
// 未设置 data-theme 时，默认跟随系统偏好
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    // 暗色变量...
  }
}
```

用户手动选择后，写入 `data-theme` 属性并持久化到 localStorage。

### 5.3 Fluent UI 主题同步

`FluentProvider` 的 theme 需跟随切换——亮色用 `onoteLightTheme`，暗色用 `onoteDarkTheme`（都从 logo 色系衍生）。

## 6. 文件改动范围

### 新建文件

| 文件 | 说明 |
|------|------|
| `packages/renderer/src/main/theme/onoteLightTheme.ts` | Fluent UI 亮色主题（替换 warmLightTheme） |
| `packages/renderer/src/main/theme/onoteDarkTheme.ts` | Fluent UI 暗色主题 |
| `packages/renderer/src/main/theme/index.ts` | 主题导出 + hook（`useOnoteTheme`） |

### 核心修改

| 文件 | 改动 |
|------|------|
| `packages/renderer/src/styles/index.scss` | 全部 `--warm-*` 变量 → 新 `--paper-*`/`--ink-*`/语义变量体系，加暗色覆盖 |
| `packages/renderer/src/styles/_mixins.scss` | focus-ring / icon-button 用新语义变量 |
| `packages/renderer/src/main/index.tsx` | `FluentProvider` 接入主题切换 |
| `packages/renderer/src/main/containers/Setting/GeneralPanel.tsx` | 新增"外观"设置项（亮色/暗色/跟随系统） |

### 组件 SCSS 变量替换

| 文件 | 替换要点 |
|------|---------|
| `Sidebar/index.module.scss` | `#f2ecde`→`var(--bg-sidebar)`，`#d3b17d`→`var(--border)`，`#5c5545`→`var(--text-secondary)` |
| `Sidebar/NoDirectory.module.scss` | `--warm-text-empty`→`var(--icon-empty)` |
| `FileTreeItem.scss` | `#d4c9b8`→`var(--bg-active)`，`#4a3f35`→`var(--text-body)` |
| `FileBrowser/Toolbar/index.module.scss` | `#fff`→`var(--bg-card)` |
| `FileBrowser/UnSupport/index.module.scss` | `--warm-*`→语义变量 |
| `ContentPanel/index.module.scss` | `--warm-*`→语义变量 |
| `SearchList.module.scss` | `#3b342b`→`var(--text-heading)`，硬编码 rgba→语义变量 |
| `ResourceTabs/index.scss` | `#4a3f35`→`var(--text-body)` |
| `Setting/Setting.tsx` | 内联颜色→CSS 变量 |
| `Input.module.scss` | `#ccc`/`#66afe9`→语义变量 |
| `ListItem.module.scss` | `#ddd`/`#fff`→语义变量 |
| `agent-diff.scss` | 颜色→语义变量 |
| `previewer/index.scss` | 保持不变（iframe 隔离，不共享主应用变量） |
| `blockquote.scss` | 保持不变（内容语义色，非 UI 色） |
| `Block.scss` | 保持不变（iframe 隔离） |

### 额外优化文件

| 文件 | 改动 |
|------|------|
| `ListItem.tsx` | 删除 `activeBackground`/`hoverBackground` props，CSS 自定义属性传递已不需要 |
| `ErrorBoundary.tsx` | 内联错误色→`--error`、`--bg-card`、`--border`、`--accent` |
| `TitleFieldTemplate.tsx` | `#555`→`--text-heading`，`#ddd`→`--border` |
| `MarkdownPanel/index.tsx` | `#dddddd`→`--border`，`#5c5545`→`--text-secondary` |
| `PlainTextPanel/index.tsx` | 同 MarkdownPanel |
| `resize.ts` | 拖拽手柄色→`--border-light`、`--text-secondary`、`--text-hint` |
| `Confirm.tsx` | `--warm-error`→`--error` |
| `useFileOperation.tsx` | `--warm-error`→`--error` |
| `auxiliary/index.tsx` | `webLightTheme`→`onoteLightTheme` |

### 删除

| 文件 | 说明 |
|------|------|
| `packages/renderer/src/main/theme/warmLightTheme.ts` | 被 onoteLightTheme.ts 替代 |

## 7. 实施状态

**✅ 已完成** — 5 commits, 32 files changed (+672/-284)

| Commit | 说明 |
|--------|------|
| `00c8668` | feat: 实现墨与纸色彩体系，亮色/暗色双主题 |
| `8d0d06f` | fix: 替换所有组件硬编码色值为语义变量 |
| `48b979a` | chore: 删除 warmLightTheme，auxiliary 改用 onoteLightTheme |
| `0722e20` | docs: 更新设计文档 |
| `9b417c2` | fix: ResourceTabs 残留硬编码色值→语义变量 |

### 审计结论

- **裸 hex 色值**：仅存在于 token 定义层（`index.scss`）和 Fluent UI 主题覆盖（`onote*Theme.ts`），组件层零残留
- **旧变量 `--warm-*`**：零残留
- **`warmLightTheme` 引用**：零残留
- **合理保留的硬编码**：
  - `agent-diff.scss` — diff 视图的通用绿/红色（非 UI 语义色）
  - `FileIcon.tsx` — 文件类型品牌色（不在迁移范围）
  - `previewer/` — iframe 隔离的预览器（不共享主应用变量）

### 用户验证清单

1. 设置 → 通用 → 外观：切换 System/Light/Dark
2. Tab 栏层级：paper-300 → paper-200 → paper-50 梯度是否清晰
3. 暗色模式：`#E7D4B6` accent 在 `#0E1620` 背景上的对比度
4. 各面板颜色一致性（Sidebar、ContentPanel、FileBrowser）
5. Fluent UI 组件（按钮、下拉框、输入框）在双主题下的表现
