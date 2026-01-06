// 拖拽配置常量
export const RESIZE_CONFIG = {
  // 编辑器配置
  editor: {
    minPercent: 10,
    maxPercent: 90,
    defaultPercent: 50,
    cssVar: '--editor-width',
  },
  // LLMBox 配置
  llmbox: {
    minPercent: 10,
    maxPercent: 50,
    defaultPercent: 30,
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
 * @param containerWidth 容器宽度
 * @param minPercent 最小百分比
 * @param maxPercent 最大百分比
 * @param isReverse 是否反向（LLMBox 拖拽时需要反向）
 */
export function updateWidth(
  cssVarName: string,
  delta: number,
  containerWidth: number,
  minPercent: number,
  maxPercent: number,
  isReverse: boolean = false
): void {
  if (containerWidth <= 0) {
    console.warn('[updateWidth] Invalid container width:', containerWidth);
    return;
  }

  const widthStr = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim();
  const width = parseFloat(widthStr) || minPercent;

  const currentPixels = (width / 100) * containerWidth;
  const newPixels = isReverse ? currentPixels - delta : currentPixels + delta;
  const newWidth = (newPixels / containerWidth) * 100;

  document.documentElement.style.setProperty(
    cssVarName,
    `${Math.max(minPercent, Math.min(maxPercent, newWidth))}%`
  );
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
      JSON.stringify({ editor: editorWidth, llmbox: llmboxWidth })
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
    `${RESIZE_CONFIG.editor.defaultPercent}%`
  );
  document.documentElement.style.setProperty(
    '--llmbox-width',
    `${RESIZE_CONFIG.llmbox.defaultPercent}%`
  );
  saveWidths();
}
