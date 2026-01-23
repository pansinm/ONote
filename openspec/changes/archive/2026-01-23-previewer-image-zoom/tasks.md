# 任务列表：预览器图片放大功能

**变更 ID**: `previewer-image-zoom`

## 阶段一：基础框架

### Task 1.1: 创建 ImagePreviewModal 组件骨架

**描述**: 创建预览弹窗的基础组件结构

**验收标准**:
- [x] 创建 `packages/renderer/src/previewer/components/ImagePreviewModal.tsx`
- [x] 使用 React Modal 作为基础
- [x] 组件接收 `isOpen`, `src`, `type`, `content`, `onClose` props
- [x] 使用 React Portal 渲染到 `document.body`

**依赖**: 无

---

### Task 1.2: 实现缩放功能

**描述**: 在 ImagePreviewModal 中实现滚轮缩放

**验收标准**:
- [x] 添加 wheel 事件监听
- [x] 实现缩放状态管理（scale state）
- [x] 使用 CSS transform 实现缩放
- [x] 缩放范围限制在 0.1 - 5.0
- [x] 添加缩放步进逻辑（0.1/次）

**依赖**: Task 1.1

---

### Task 1.3: 实现拖拽功能

**描述**: 使用 react-draggable 实现内容拖拽

**验收标准**:
- [x] 集成 `react-draggable` 库
- [x] 预览内容可拖拽
- [x] 拖拽边界限制在弹窗视口内
- [x] 添加拖拽手柄区域

**依赖**: Task 1.1

---

### Task 1.4: 实现关闭功能

**描述**: 实现 ESC 键和点击遮罩关闭

**验收标准**:
- [x] 按 ESC 键关闭弹窗
- [x] 点击遮罩关闭弹窗
- [x] 关闭时重置缩放和位置状态

**依赖**: Task 1.1

---

## 阶段二：组件集成

### Task 2.1: 修改 Image 组件支持双击预览

**描述**: 为图片组件添加双击事件

**验收标准**:
- [x] Image 组件添加 onDoubleClick 事件
- [x] 双击时打开预览弹窗
- [x] 传递正确的 src 和 type

**修改文件**:
- `packages/renderer/src/previewer/markdown/handlers/image.tsx`

**依赖**: Task 1.1

---

### Task 2.2: 修改 Diagram 组件支持双击预览

**描述**: 为图表组件添加双击事件

**验收标准**:
- [x] Diagram 组件添加 onDoubleClick 事件
- [x] 双击时打开预览弹窗
- [x] 传递 SVG 内容

**修改文件**:
- `packages/renderer/src/previewer/integration/diagram/diagram.tsx`

**依赖**: Task 1.1

---

### Task 2.3: 修改 Typst 组件支持双击预览

**描述**: 为 Typst 组件添加双击事件

**验收标准**:
- [x] Typst 组件添加 onDoubleClick 事件
- [x] 双击时打开预览弹窗
- [x] 传递渲染后的图片 URL

**修改文件**:
- `packages/renderer/src/previewer/typst/Typst.tsx`

**依赖**: Task 1.1

---

## 阶段三：样式与优化

### Task 3.1: 添加预览弹窗样式

**描述**: 编写预览弹窗的 CSS 样式

**验收标准**:
- [x] 创建 `ImagePreviewModal.module.scss`
- [x] 遮罩层样式（全屏深色背景）
- [x] 内容容器样式
- [x] 拖拽手柄样式
- [x] 关闭按钮样式

---

### Task 3.2: 性能优化

**描述**: 优化预览组件的渲染性能

**验收标准**:
- [x] 使用 React.memo 缓存组件
- [x] 优化大图加载（使用 CSS containment）
- [x] 事件节流处理

---

## 阶段四：测试

### Task 4.1: 单元测试

**描述**: 编写组件单元测试

**验收标准**:
- [x] ImagePreviewModal 渲染测试
- [x] 缩放功能测试
- [x] 拖拽功能测试
- [x] 关闭功能测试

**测试文件**: `packages/renderer/src/previewer/components/__tests__/ImagePreviewModal.test.tsx`

---

### Task 4.2: E2E 测试

**描述**: 编写用户交互 E2E 测试

**验收标准**:
- [ ] 双击图片触发预览（后续实现）
- [ ] 滚轮缩放交互（后续实现）
- [ ] 拖拽交互（后续实现）
- [ ] ESC 关闭（后续实现）

**注意**: E2E 测试需在应用运行环境下进行，建议后续 PR 实现

---

## 依赖关系图

```
Task 1.1 ──┬── Task 1.2 ── Task 3.2 ── Task 4.1 ── Task 4.2
          │
          ├── Task 1.3 ── (同上)
          │
          ├── Task 1.4 ── (同上)
          │
          ├── Task 2.1 ── (同上)
          │
          ├── Task 2.2 ── (同上)
          │
          └── Task 2.3 ── (同上)
               │
               └── Task 3.1
```

## 并行执行建议

- Task 1.1, 1.2, 1.3, 1.4 可以并行开发（不同文件）
- Task 2.1, 2.2, 2.3 可以并行开发
- Task 3.1, 3.2 可以并行
- Task 4.1, 4.2 可以并行
