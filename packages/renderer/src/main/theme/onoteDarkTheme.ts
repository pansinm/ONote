/**
 * ONote 墨与纸 — 暗色主题
 *
 * 从 Logo 提取的纸色 (#E7D4B6) 作为品牌色，
 * 覆盖 Fluent UI webDarkTheme 的品牌色令牌。
 */

import { webDarkTheme } from '@fluentui/react-components';
import type { Theme } from '@fluentui/react-components';

export const onoteDarkTheme: Theme = {
  ...webDarkTheme,

  // ── 品牌前景色（文字、链接）──
  colorBrandForeground1: '#E7D4B6',
  colorBrandForeground2: '#D4C4A6',
  colorBrandForeground2Hover: '#F0E6D6',
  colorBrandForeground2Pressed: '#F0E6D6',
  colorBrandForegroundLink: '#E7D4B6',
  colorBrandForegroundLinkHover: '#F0E6D6',
  colorBrandForegroundLinkPressed: '#D4C4A6',
  colorBrandForegroundLinkSelected: '#D4C4A6',
  colorBrandForegroundOnLight: '#E7D4B6',
  colorBrandForegroundOnLightHover: '#F0E6D6',
  colorBrandForegroundOnLightPressed: '#D4C4A6',
  colorBrandForegroundOnLightSelected: '#D4C4A6',

  colorNeutralForeground2BrandHover: '#F0E6D6',
  colorNeutralForeground2BrandPressed: '#D4C4A6',
  colorNeutralForeground2BrandSelected: '#E7D4B6',
  colorNeutralForeground3BrandHover: '#F0E6D6',
  colorNeutralForeground3BrandPressed: '#D4C4A6',
  colorNeutralForeground3BrandSelected: '#E7D4B6',

  // ── Compound brand ──
  colorCompoundBrandForeground1: '#E7D4B6',
  colorCompoundBrandForeground1Hover: '#F0E6D6',
  colorCompoundBrandForeground1Pressed: '#D4C4A6',
  colorCompoundBrandBackground: '#E7D4B6',
  colorCompoundBrandBackgroundHover: '#F0E6D6',
  colorCompoundBrandBackgroundPressed: '#D4C4A6',
  colorCompoundBrandStroke: '#E7D4B6',
  colorCompoundBrandStrokeHover: '#F0E6D6',
  colorCompoundBrandStrokePressed: '#D4C4A6',

  // ── 品牌背景（Primary Button）──
  colorBrandBackground: '#E7D4B6',
  colorBrandBackgroundHover: '#F0E6D6',
  colorBrandBackgroundPressed: '#D4C4A6',
  colorBrandBackgroundSelected: '#D4C4A6',
  colorBrandBackgroundStatic: '#E7D4B6',
  colorBrandBackground2: '#1A2535',
  colorBrandBackground2Hover: '#1F2B3A',
  colorBrandBackground2Pressed: '#2C3E52',
  colorBrandBackground3Static: '#D4C4A6',
  colorBrandBackground4Static: '#B0A08F',

  // ── 品牌反色 ──
  colorBrandForegroundInverted: '#0E1620',
  colorBrandForegroundInvertedHover: '#1F2B3A',
  colorBrandForegroundInvertedPressed: '#0E1620',
  colorBrandBackgroundInverted: '#0E1620',
  colorBrandBackgroundInvertedHover: '#1A2535',
  colorBrandBackgroundInvertedPressed: '#1F2B3A',
  colorBrandBackgroundInvertedSelected: '#1A2535',

  // ── Neutral on Brand ──
  colorNeutralForegroundOnBrand: '#0E1620',
  colorNeutralStrokeOnBrand: '#0E1620',
  colorNeutralStrokeOnBrand2: '#0E1620',
  colorNeutralStrokeOnBrand2Hover: '#0E1620',
  colorNeutralStrokeOnBrand2Pressed: '#0E1620',
  colorNeutralStrokeOnBrand2Selected: '#0E1620',

  // ── 品牌描边 ──
  colorBrandStroke1: '#E7D4B6',
  colorBrandStroke2: '#3A3228',
  colorBrandStroke2Hover: '#5C5545',
  colorBrandStroke2Pressed: '#E7D4B6',
  colorBrandStroke2Contrast: '#3A3228',

  // ── Surface 背景覆盖（让 Fluent 组件贴合墨色底）──
  colorNeutralBackground1: '#0E1620',
  colorNeutralBackground1Hover: '#141E2C',
  colorNeutralBackground1Pressed: '#1A2535',
  colorNeutralBackground1Selected: '#1F2B3A',
  colorNeutralBackground2: '#141E2C',
  colorNeutralBackground2Hover: '#1A2535',
  colorNeutralBackground2Pressed: '#1F2B3A',
  colorNeutralBackground2Selected: '#1A2535',
  colorNeutralBackground3: '#1A2535',
  colorNeutralBackground3Hover: '#1F2B3A',
  colorNeutralBackground3Pressed: '#2C3E52',
  colorNeutralBackground3Selected: '#1F2B3A',
  colorNeutralBackground4: '#1F2B3A',
  colorNeutralBackground4Hover: '#2C3E52',
  colorNeutralBackground4Pressed: '#3D5168',
  colorNeutralBackground4Selected: '#2C3E52',
  colorNeutralBackground5: '#2C3E52',
  colorNeutralBackground5Hover: '#3D5168',
  colorNeutralBackground5Pressed: '#4A6580',
  colorNeutralBackground5Selected: '#3D5168',
  colorNeutralBackground6: '#0E1620',

  // ── 文字色覆盖 ──
  colorNeutralForeground1: '#F0E6D6',
  colorNeutralForeground1Hover: '#FFFCF5',
  colorNeutralForeground1Pressed: '#D4C4A6',
  colorNeutralForeground1Selected: '#FFFCF5',
  colorNeutralForeground2: '#D4C4A6',
  colorNeutralForeground2Hover: '#F0E6D6',
  colorNeutralForeground2Pressed: '#B0A08F',
  colorNeutralForeground2Selected: '#F0E6D6',
  colorNeutralForeground3: '#B0A08F',
  colorNeutralForeground3Hover: '#D4C4A6',
  colorNeutralForeground3Pressed: '#8A8886',
  colorNeutralForeground3Selected: '#D4C4A6',
  colorNeutralForeground4: '#8A8886',
  colorNeutralForegroundDisabled: '#5C5545',
  colorNeutralForegroundInvertedDisabled: '#5C5545',

  // ── 描边覆盖 ──
  colorNeutralStroke1: '#3A3228',
  colorNeutralStroke1Hover: '#5C5545',
  colorNeutralStroke1Pressed: '#3A3228',
  colorNeutralStroke1Selected: '#5C5545',
  colorNeutralStroke2: '#2A2420',
  colorNeutralStroke3: '#3A3228',
  colorNeutralStrokeAccessible: '#5C5545',
  colorNeutralStrokeAccessibleHover: '#8A8886',
  colorNeutralStrokeAccessiblePressed: '#5C5545',
};
