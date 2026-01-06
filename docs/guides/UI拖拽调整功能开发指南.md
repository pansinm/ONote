# UI 拖拽调整功能开发指南

## 概述

本文档总结在实现拖拽调整功能时的最佳实践、常见问题和解决方案。

## 场景

实现面板宽度拖拽调整功能，支持：
- 百分比宽度（而非固定像素）
- 拖拽条始终跟随边界
- 多个面板独立调整
- 用户设置持久化

## 技术实现

### 核心架构

```
┌─────────────────────────────────────────────────────┐
│  容器容器（position: relative, overflow: hidden） │
│  ┌─────────────────────────────────────────────┐   │
│  │  子容器（flex: 1）                       │   │
│  │  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │ 面板 A      │  │ 拖拽条          │  │   │
│  │  │ width: var  │  │ right: -2px     │  │   │
│  │  └─────────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  拖拽指示线（z-index: 10000）            │   │
│  │  position: absolute                       │   │
│  │  left: currentX                           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 关键技术点

#### 1. CSS 变量控制宽度

```css
:root {
  --editor-width: 50%;
  --llmbox-width: 30%;
}

.panel {
  width: var(--editor-width);
}
```

**优势：**
- 动态调整无需重新计算布局
- 可通过 JavaScript 直接修改
- 响应式友好

#### 2. 拖拽条放在容器内部，避免裁剪

```tsx
<div style={{ width: 'var(--panel-width)', overflowY: 'hidden' }}>
  <PanelContent />
  <DragHandle position="right" offset="-2px" />
</div>
```

**关键点：**
- 使用 `overflowY: 'hidden'` 而非 `overflow: 'hidden'`
- 拖拽条放在面板内部容器内
- 使用 CSS 定位自动跟随边界

#### 3. 窗口级别事件监听

```tsx
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => { /* ... */ };
  const handleMouseUp = (e: MouseEvent) => { /* ... */ };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDragging]);
```

**优势：**
- 鼠标移出窗口仍能捕获事件
- 防止 iframe 捕获鼠标事件
- 避免事件监听器泄漏

#### 4. 自定义 Hook 封装逻辑

```typescript
export function useResizable({ containerRef }: UseResizableOptions) {
  const [dragState, setDragState] = useState<DragState>({...});

  useEffect(() => {
    if (!dragState.isDragging) return;
    // 事件处理逻辑
  }, [dragState.isDragging, dragState.startX, dragState.type]);

  const startDrag = useCallback((type: string, startX: number) => {
    setDragState({ isDragging: true, type, startX });
  }, []);

  return { dragState, startDrag };
}
```

**优势：**
- 逻辑复用
- 组件简化
- 易于测试

#### 5. 配置常量集中管理

```typescript
export const RESIZE_CONFIG = {
  panel: {
    minPercent: 10,
    maxPercent: 90,
    defaultPercent: 50,
  },
  dragHandle: {
    width: '4px',
    hoverColor: 'rgb(56, 147, 199)',
  },
} as const;
```

**优势：**
- 消除魔法数字
- 统一修改入口
- 易于维护

## 常见问题与解决方案

### 问题 1：拖拽条被 overflow 裁剪

**现象：**
拖拽时拖拽条或指示线不可见

**原因：**
父容器设置了 `overflow: 'hidden'`

**解决方案：**
```tsx
// ❌ 错误
<div style={{ overflow: 'hidden' }}>
  <DragHandle />
</div>

// ✅ 正确
<div style={{ overflowY: 'hidden' }}>
  <DragHandle />
</div>
```

或者将拖拽指示线放在最外层容器，设置 `z-index: 10000`

### 问题 2：窗口大小时拖拽条位置错位

**现象：**
调整窗口大小后，拖拽条不在正确位置

**原因：**
使用硬编码的像素值定位

**解决方案：**
```tsx
// ❌ 错误
<DragHandle left={calculatedPixels + 'px'} />

// ✅ 正确
<DragHandle left={`calc(var(--panel-width) - 2px)`} />
```

### 问题 3：拖拽方向错误

**现象：**
拖拽方向与预期相反

**原因：**
没有考虑拖拽条的位置（左侧 vs 右侧）

**解决方案：**
```typescript
// 右侧拖拽条
updateWidth(cssVar, delta, width, min, max, false);

// 左侧拖拽条（需要反向）
updateWidth(cssVar, delta, width, min, max, true);
```

### 问题 4：性能问题

**现象：**
频繁的 DOM 操作导致卡顿

**原因：**
useEffect 依赖整个状态对象，每次都重新绑定事件

**解决方案：**
```typescript
// ❌ 错误
useEffect(() => {
  // ...
}, [dragState]); // 每次状态变化都重新绑定

// ✅ 正确
useEffect(() => {
  // ...
}, [dragState.isDragging, dragState.type]); // 只在必要时重新绑定
```

### 问题 5：删除文件导致 build 失败

**现象：**
删除某个组件文件后，其他文件报错找不到模块

**原因：**
没有检查该文件是否被其他文件引用

**解决方案：**
1. 先使用 `grep` 搜索引用：
   ```bash
   grep -r "DragBar" packages/renderer/src/
   ```

2. 创建兼容的导出文件：
   ```typescript
   // DragBar.tsx (向后兼容)
   export { DragIndicator, DragHandle as default } from './DragBarNew';
   ```

3. 或者保留原有文件，同时实现新文件

## 最佳实践

### 1. 渐进式开发

**步骤：**
1. 先实现核心功能（拖拽调整）
2. 再优化性能（useEffect 依赖）
3. 最后增强体验（视觉反馈、持久化）

**好处：**
- 降低风险
- 易于回滚
- 每个阶段都可测试

### 2. 测试驱动

**每次修改后：**
```bash
yarn build  # 编译检查
yarn dev    # 运行测试
```

**好处：**
- 及时发现问题
- 避免累积错误
- 确保代码质量

### 3. 用户确认后再提交

**流程：**
1. 实现功能
2. 测试验证
3. 用户确认
4. 提交代码

**避免：**
- 贸然删除文件
- 大规模重构未测试
- 未经用户同意直接提交

### 4. 代码复用与抽象

**何时抽象：**
- ✅ 逻辑在 3 个以上地方重复
- ✅ 组件代码超过 200 行
- ✅ 配置分散在多处

**何时不要抽象：**
- ❌ 只用一次的逻辑
- ❌ 过度设计，增加复杂度
- ❌ 简单的 CRUD 操作

### 5. 性能优化优先级

**高优先级：**
- 修复明显的性能问题（如 useEffect 依赖）
- 移除不必要的 DOM 操作
- 减少重复计算

**中优先级：**
- 抽取自定义 Hook
- 使用 React.memo
- 代码分割

**低优先级：**
- 微优化（如用 Math.floor 代替 ~~）
- 过度抽象
- 不必要的 memoization

## 代码示例

### 完整的拖拽组件实现

参见：
- `/packages/renderer/src/common/hooks/useResizable.ts`
- `/packages/renderer/src/components/DragBarNew.tsx`
- `/packages/renderer/src/main/containers/FileBrowser/FilePannel.tsx`

## 经验教训

1. **不要贸然删除文件**
   - 先搜索引用关系
   - 考虑向后兼容
   - 或使用 tsconfig paths 重定向

2. **考虑边界条件**
   - 最小/最大宽度限制
   - 容器不存在的情况
   - 窗口大小变化

3. **用户体验优先**
   - 拖拽时提供视觉反馈
   - hover 状态清晰
   - 支持重置为默认值

4. **性能与可维护性平衡**
   - 先优化明显的性能问题
   - 代码结构要清晰
   - 避免过度优化

5. **文档先行**
   - 复杂功能写注释
   - 记录决策原因
   - 提供使用示例

## 相关文档

- [开发指南](./开发指南.md)
- [代码规范](./reference/代码规范.md)
- [常见问题](./reference/常见问题.md)
