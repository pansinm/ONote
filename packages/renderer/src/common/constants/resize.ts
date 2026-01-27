// 拖拽配置常量
export const RESIZE_CONFIG = {
  // 编辑器配置
  editor: {
    min: 100,
    max: 1200,
    default: 500,
    cssVar: '--editor-width',
  },
  // LLMBox 配置
  llmbox: {
    min: 200,
    max: 800,
    default: 400,
    cssVar: '--llmbox-width',
  },
  // 拖拽手柄配置
  dragHandle: {
    width: '4px',
    hoverColor: 'rgb(56, 147, 199)',
    defaultColor: 'rgba(56, 147, 199, 0.2)',
    zIndex: 1000,
  },
  // 拖拽指示线配置
  dragIndicator: {
    width: '2px',
    color: 'rgb(56, 147, 199)',
    zIndex: 10000,
  },
  // 遮罩层配置
  overlay: {
    zIndex: 9998,
  },
} as const;

/**
 * 更新 CSS 变量宽度
 * @param cssVarName CSS 变量名
 * @param delta 拖拽增量
 * @param min 最小像素值
 * @param max 最大像素值
 * @param isReverse 是否反向（LLMBox 拖拽时需要反向）
 */
export function updateWidth(
  cssVarName: string,
  delta: number,
  min: number,
  max: number,
  isReverse = false,
): void {
  const widthStr = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim();
  const currentPixels = parseFloat(widthStr) || min;
  const newPixels = isReverse ? currentPixels - delta : currentPixels + delta;
  const newWidth = Math.max(min, Math.min(max, newPixels));

  document.documentElement.style.setProperty(cssVarName, `${newWidth}px`);
}

/**
 * 从本地存储加载面板宽度设置
 */
export function loadSavedWidths(): void {
  try {
    const saved = localStorage.getItem('onote-panel-widths');
    if (saved) {
      const widths = JSON.parse(saved);
      if (widths.editor) {
        document.documentElement.style.setProperty('--editor-width', widths.editor);
      }
      if (widths.llmbox) {
        document.documentElement.style.setProperty('--llmbox-width', widths.llmbox);
      }
    }
  } catch (error) {
    console.error('[loadSavedWidths] Failed to load widths:', error);
  }
}

/**
 * 保存面板宽度设置到本地存储
 */
export function saveWidths(): void {
  try {
    const editorWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--editor-width')
      .trim();
    const llmboxWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--llmbox-width')
      .trim();
    localStorage.setItem(
      'onote-panel-widths',
      JSON.stringify({ editor: editorWidth, llmbox: llmboxWidth }),
    );
  } catch (error) {
    console.error('[saveWidths] Failed to save widths:', error);
  }
}

/**
 * 重置面板宽度为默认值
 */
export function resetWidths(): void {
  document.documentElement.style.setProperty(
    '--editor-width',
    `${RESIZE_CONFIG.editor.default}px`,
  );
  document.documentElement.style.setProperty(
    '--llmbox-width',
    `${RESIZE_CONFIG.llmbox.default}px`,
  );
  saveWidths();
}
