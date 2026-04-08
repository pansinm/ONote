# 「纸与墨」设计规格 — CSS 可执行方案

> 设计审查：Donald Norman 🎯
> 产品方向：乔布斯
> 状态：待实施

## 设计原则

书架（Sidebar）→ 桌面（Tab 栏）→ 纸（内容区）→ 工具（LLMBox）
三层暖色阶递减，亮度递增。用户自然地把浅色区域读为「焦点」，深色区域读为「容器」。

## 色板

```
Sidebar 背景    #f2ecde  ← 不变，锚点
Tab 栏背景      #e8e0d0  ← 比 Sidebar 浅一度
Tab 非激活态    #ede6d6  ← 比背景再浅
Tab 激活态      #fffcf5  ← 微暖白
内容区背景      #fffcf5  ← 同 Tab 激活态（无缝衔接）
LLMBox 背景     #ffffff  ← 冷白，工具区

分割线/边框统一：
  Tab 分隔线      rgba(139, 126, 104, 0.25)
  Tab close hover rgba(0,0,0,0.06)
  Drag 指示线     rgba(180, 160, 130, 0.6)
  Drag hover      rgba(139, 126, 104, 0.6)
  Drag dragging   #8b7e68
```

## 视觉架构

改前（三层 + 三种色调）：
```
┌─────────────┬──────────────────────────────┐
│  Sidebar    │  Chrome Tab Bar (transparent)│
│  #f2ecde    ├──────────────────────────────┤
│             │  Toolbar (box-shadow)         │
│             ├────────┬──────────┬───────────┤
│             │ Editor │ Preview  │ LLMBox    │
│             │  #fff  │  #fff    │  #fff     │
└─────────────┴────────┴──────────┴───────────┘
```

改后（两层 + 暖色阶）：
```
┌───────────┬─────────────────────────────────────┐
│           │ [Tab1] [Tab2] [...]     QR 分局 AI  │  ← 一行
│  Sidebar  │─────────────────────────────────────│
│  #f2ecde  │  Editor    │  Preview  │  LLMBox   │
│           │  #fffcf5   │  #fffcf5  │  #fff     │
└───────────┴────────────┴───────────┴───────────┘
```

## 改动清单

### 1. 全局样式 `styles/index.scss`

#### 1a. 在 `:root` 中添加 CSS 变量
```scss
:root {
  --editor-width: 50%;
  --sidebar-width: 230px;
  --llmbox-width: 30%;
  /* 纸与墨 色板 */
  --tab-bar-bg: #e8e0d0;
  --tab-inactive-bg: #ede6d6;
  --tab-active-bg: #fffcf5;
  --content-bg: #fffcf5;
  --tool-bg: #ffffff;
}
```

#### 1b. 替换 `.chrome-tabs` 块（当前第 59 行）
```scss
// 删除旧的：
// .chrome-tabs { background: #e9f1f6 !important; }

// 替换为：
.chrome-tabs {
  background: var(--tab-bar-bg) !important;
}
```

#### 1c. 取消注释并修正激活 Tab 填充色（当前第 63-70 行被注释）
```scss
.chrome-tabs
  .chrome-tab[active]
  .chrome-tab-background
  > svg
  .chrome-tab-geometry {
  fill: var(--tab-active-bg);
}

.chrome-tabs
  .chrome-tab:not([active])
  .chrome-tab-background
  > svg
  .chrome-tab-geometry {
  fill: var(--tab-inactive-bg);
}
```

#### 1d. 添加新的覆盖规则（在文件末尾 `#app` 之前）
```scss
/* Tab 分隔线 — 暖色替换冷灰 #a9adb0 */
.chrome-tabs .chrome-tab .chrome-tab-dividers::before,
.chrome-tabs .chrome-tab .chrome-tab-dividers::after {
  background: rgba(139, 126, 104, 0.25) !important;
}

/* 底栏 — 跟内容区色无缝衔接 */
.chrome-tabs .chrome-tabs-bottom-bar {
  background: var(--content-bg);
}

/* Tab 标题色 — 暖黑 */
.chrome-tabs .chrome-tab .chrome-tab-title {
  color: #4a3f35;
}
.chrome-tabs .chrome-tab[active] .chrome-tab-title {
  color: #2b2118;
}

/* Tab close 按钮 hover — 暖灰 */
.chrome-tabs .chrome-tab .chrome-tab-close:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
}
.chrome-tabs .chrome-tab .chrome-tab-close:hover:active {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
```

---

### 2. ResourceTabs `ResourceTabs/index.scss`

完整替换为：
```scss
.react-tabs-container {
  background: var(--tab-bar-bg) !important;
  border-color: transparent !important;
}

.react-tabs-tab {
  color: #4a3f35 !important;
}

.react-tabs-tab-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.react-tabs-active {
  border-color: transparent !important;
  background-color: transparent !important;
  /* 去掉蓝色底线 — 激活态靠 fill 色差区分 */
  border-bottom: none !important;
}

.react-tabs-tab-close {
  border: 0 !important;
  background: transparent !important;
}

.react-tabs-tab-close:hover {
  border: 0 !important;
  background: rgba(0, 0, 0, 0.06) !important;
}

.chrome-tabs {
  height: 40px;
  padding: 6px 0px 0px 0px;
}
```

---

### 3. DragHandle 颜色 `common/constants/resize.ts`

修改两处颜色值：

```ts
// dragHandle 对象：
dragHandle: {
    hitAreaWidth: '10px',
    lineWidth: '2px',
    defaultColor: 'rgba(139, 126, 104, 0)',    // 透明（不变）
    hoverColor: 'rgba(139, 126, 104, 0.6)',    // 暖灰 hover（原 rgba(0,120,212,0.5)）
    draggingColor: '#8b7e68',                   // 暖灰拖拽中（原 #0078d4）
    zIndex: 1000,
},

// dragIndicator 对象：
dragIndicator: {
    width: '2px',
    color: 'rgba(180, 160, 130, 0.6)',          // 暖灰（原 rgb(56, 147, 199)）
    zIndex: 10000,
},
```

---

### 4. Toolbar 合并进 Tab 栏

这是结构性改动，涉及文件重组。

#### 4a. `ContentPanel/index.tsx`

将 Toolbar 图标提取出来，跟 ResourceTabs 横向排列。

当前结构（两层纵向堆叠）：
```tsx
<ResourceTabs />
<div style={{ height: 'calc(100% - 40px)', ... }}>
  <ResourcePanel />
</div>
```

改为：
```tsx
<div style={{ display: 'flex', alignItems: 'center', background: 'var(--tab-bar-bg)' }}>
  <div style={{ flex: 1, overflow: 'hidden' }}>
    <ResourceTabs />
  </div>
  <ToolbarActions isMarkdown={isMarkdown(currentUri)} />
</div>
<div style={{ flex: 1, position: 'relative', background: 'var(--content-bg)' }}>
  <ResourcePanel />
</div>
```

#### 4b. Toolbar 拆分

把 `Toolbar/index.tsx` 拆成：
- `ToolbarActions.tsx` — 纯按钮行（QR、布局、AI），不再有 box-shadow、不再有 padding left/right 大量空间，改为紧凑的图标行
- 移除 `<Flex>` 包裹和 `boxShadow` prop
- 图标间距改为 `gap: 8px`
- 样式直接内联或用 makeStyles

#### 4c. `FilePannel.tsx` 移除 Toolbar 渲染

```tsx
// 删除这行：
// <Toolbar isMarkdown={isMarkdown(props.uri)} />
```

Toolbar 的工具按钮已经移到 ContentPanel 层级，跟 Tab 栏同行。

#### 4d. ContentPanel 需要获取当前文件 URI 判断 isMarkdown

```tsx
const activeFileUri = stores.activationStore.activeFileUri;
const currentUri = activeFileUri || '';
```

---

### 5. 内容区背景色

Monaco Editor 和 Preview 的容器背景改为 `--content-bg`。

#### 5a. `styles/index.scss` 追加
```scss
.editor-container {
  background: var(--content-bg);
}
```

---

### 6. 不需要改的

- **Sidebar `index.module.scss`** — `#f2ecde` 不变
- **LLMBox `LLMBox.module.scss`** — `#ffffff` 不变
- **`.sidebar` 的 border** — 不加，靠色彩差自然分割
- **DragHandle 组件逻辑** — 不改，只改颜色配置
- **SearchList / Directory** — 不改，它们在 Sidebar 里，色板不变

---

## 实施顺序

1. ✅ 先改色板（文件 1-3）— 风险最低，纯视觉
2. ✅ 验证 Tab 栏视觉正确
3. ✅ 再改结构（文件 4）— Toolbar 合并进 Tab 栏
4. ✅ 最后改内容区背景（文件 5）

## 验证标准

- [ ] Tab 栏背景色跟 Sidebar 右边缘无突兀分界
- [ ] 激活 Tab 跟下方内容区色一致，无可见分割线
- [ ] 非激活 Tab 可见但低调
- [ ] 拖拽手柄 hover/dragging 为暖灰色，不是蓝色
- [ ] LLMBox 白色跟内容区暖白有可感知但微妙的差异
- [ ] 整体无冷色（蓝色、冷灰）残留
