// 拖拽配置常量
export const RESIZE_CONFIG = {
  // 侧边栏配置（统一面板：目录树 + 文件列表）
  sidebar: {
    min: 150,
    max: 500,
    default: 230,
    cssVar: '--sidebar-width',
    unit: 'px' as const,
  },
  // 编辑器配置
  editor: {
    min: 10,
    max: 90,
    default: 50,
    cssVar: '--editor-width',
    unit: '%' as const,
  },
  // LLMBox 配置
  llmbox: {
    min: 10,
    max: 80,
    default: 30,
    cssVar: '--llmbox-width',
    unit: '%' as const,
  },
  // 拖拽手柄配置
  dragHandle: {
    /** 可交互区域宽度（视觉线更细，居中显示） */
    hitAreaWidth: '10px',
    /** 可见拖拽指示线宽度 */
    lineWidth: '2px',
    /** 默认状态（透明 — 暖色系，hover 才出现） */
    defaultColor: 'rgba(139, 126, 104, 0)',
    /** hover 状态（暖灰半透明） */
    hoverColor: 'rgba(139, 126, 104, 0.6)',
    /** 拖拽中状态（暖灰实心） */
    draggingColor: '#8b7e68',
    zIndex: 1000,
  },
  // 拖拽指示线配置
  dragIndicator: {
    width: '2px',
    color: 'rgba(180, 160, 130, 0.6)',
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
 * @param delta 拖拽增量（像素）
 * @param min 最小值（px 为像素，% 为百分比）
 * @param max 最大值（px 为像素，% 为百分比）
 * @param unit 单位类型
 * @param isReverse 是否反向（llmbox 手柄在左侧，向左拖 delta < 0，宽度应变大）
 * @param referenceWidth % 单位的参考容器像素宽度（即 CSS 变量所在元素的 containing block 宽度）
 */
export function updateWidth(
  cssVarName: string,
  delta: number,
  min: number,
  max: number,
  unit: 'px' | '%',
  isReverse = false,
  referenceWidth?: number,
): void {
  const root = document.documentElement;
  const widthStr = getComputedStyle(root).getPropertyValue(cssVarName).trim();

  if (unit === 'px') {
    const currentPixels = parseFloat(widthStr) || min;
    const newPixels = isReverse ? currentPixels - delta : currentPixels + delta;
    const clampedWidth = Math.max(min, Math.min(max, newPixels));
    root.style.setProperty(cssVarName, `${clampedWidth}px`);
  } else {
    // % 单位：参考容器宽度必须由调用方传入，否则降级到 window.innerWidth
    const containerWidth = referenceWidth || window.innerWidth;
    const currentPercent = parseFloat(widthStr) || min;
    const currentPixels = (currentPercent / 100) * containerWidth;
    const effectiveDelta = isReverse ? -delta : delta;
    const newPixels = currentPixels + effectiveDelta;
    const newPercent = (newPixels / containerWidth) * 100;
    const clampedPercent = Math.max(min, Math.min(max, newPercent));
    root.style.setProperty(cssVarName, `${clampedPercent}%`);
  }
}

/**
 * 从本地存储加载面板宽度设置
 * 会校验单位一致性，丢弃单位不匹配的旧值（旧 bug 可能将 % 变量写成了 px）
 */
export function loadSavedWidths(): void {
  try {
    const saved = localStorage.getItem('onote-panel-widths');
    if (!saved) return;
    const widths = JSON.parse(saved);
    const root = document.documentElement;

    type PanelKey = 'sidebar' | 'editor' | 'llmbox';
    const expectedUnits: Record<PanelKey, string> = {
      sidebar: 'px',
      editor: '%',
      llmbox: '%',
    };

    for (const [key, expectedSuffix] of Object.entries(expectedUnits) as [PanelKey, string][]) {
      const value = widths[key];
      if (typeof value !== 'string') continue;
      const config = RESIZE_CONFIG[key];
      // 单位校验：值必须以期望的后缀结尾
      if (!value.endsWith(expectedSuffix)) {
        console.warn(`[loadSavedWidths] Discarding stale ${key} value "${value}" (expected ${expectedSuffix}), using default`);
        root.style.setProperty(config.cssVar, `${config.default}${expectedSuffix}`);
        continue;
      }
      root.style.setProperty(config.cssVar, value);
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
    const root = document.documentElement;
    const widths = {
      sidebar: getComputedStyle(root).getPropertyValue('--sidebar-width').trim(),
      editor: getComputedStyle(root).getPropertyValue('--editor-width').trim(),
      llmbox: getComputedStyle(root).getPropertyValue('--llmbox-width').trim(),
    };
    localStorage.setItem('onote-panel-widths', JSON.stringify(widths));
  } catch (error) {
    console.error('[saveWidths] Failed to save widths:', error);
  }
}

/**
 * 重置面板宽度为默认值
 */
export function resetWidths(): void {
  document.documentElement.style.setProperty(
    '--sidebar-width',
    `${RESIZE_CONFIG.sidebar.default}px`,
  );
  document.documentElement.style.setProperty(
    '--editor-width',
    `${RESIZE_CONFIG.editor.default}%`,
  );
  document.documentElement.style.setProperty(
    '--llmbox-width',
    `${RESIZE_CONFIG.llmbox.default}%`,
  );
  saveWidths();
}
