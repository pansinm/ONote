# 设计文档：预览器图片放大功能

## 架构设计

### 组件结构

```
Previewer
├── Image (with preview support)
│   └── Block
├── Diagram (with preview support)
│   └── Block
├── Typst (with preview support)
│   └── Block
└── ImagePreviewModal (React Portal)
    ├── Overlay
    ├── Content (draggable)
    │   ├── CloseButton
    │   ├── ImageContent
    │   └── Controls (optional)
    └── ZoomState
```

### 状态管理

```typescript
interface ImagePreviewState {
  isOpen: boolean;
  src: string;
  type: 'image' | 'diagram' | 'typst';
  content: string; // SVG content or img src
  scale: number;
  position: { x: number; y: number };
}
```

## 实现细节

### 1. ImagePreviewModal 组件

使用 React Portal 渲染到 `document.body`：

```tsx
import ReactModal from 'react-modal';
import Draggable from 'react-draggable';

function ImagePreviewModal({ isOpen, src, onClose }) {
  return (
    <ReactModal isOpen={isOpen} onRequestClose={onClose}>
      <Draggable>
        <div className="preview-content">
          <img src={src} style={{ transform: `scale(${scale})` }} />
        </div>
      </Draggable>
    </ReactModal>
  );
}
```

### 2. 缩放实现

```typescript
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  setScale((prev) => Math.min(Math.max(prev + delta, 0.1), 5));
};
```

### 3. 拖拽实现

使用 `react-draggable` 的 `<Draggable>` 组件包裹内容区域：

```tsx
<Draggable bounds="parent" handle=".preview-header">
  <div className="preview-content">
    <div className="preview-header">拖拽手柄</div>
    <img src={src} />
  </div>
</Draggable>
```

### 4. 事件处理

```typescript
const handleDoubleClick = () => {
  setPreviewState({ isOpen: true, src, type: 'image' });
};
```

## 样式设计

```scss
.preview-modal {
  .react-modal__overlay {
    background: rgba(0, 0, 0, 0.85);
  }

  .preview-content {
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;

    img {
      max-width: 100%;
      max-height: calc(90vh - 40px);
    }
  }
}
```

## 性能优化

1. 使用 CSS `transform` 而非改变 width/height
2. 使用 React.memo 缓存渲染结果
3. 大图使用渐进式加载

## 可访问性

- 支持键盘 ESC 关闭
- 支持 Tab 导航
- ARIA 标签
