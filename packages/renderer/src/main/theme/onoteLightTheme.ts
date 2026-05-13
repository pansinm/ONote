/**
 * ONote 墨与纸 — 亮色主题
 *
 * 从 Logo 提取的墨色 (#1F2B3A) 作为品牌色，
 * 覆盖 Fluent UI webLightTheme 的品牌色令牌。
 */

import { webLightTheme } from '@fluentui/react-components';
import type { Theme } from '@fluentui/react-components';

export const onoteLightTheme: Theme = {
  ...webLightTheme,

  // ── 品牌前景色（文字、链接）──
  colorBrandForeground1: '#1F2B3A',
  colorBrandForeground2: '#2C3E52',
  colorBrandForeground2Hover: '#0E1620',
  colorBrandForeground2Pressed: '#0E1620',
  colorBrandForegroundLink: '#1F2B3A',
  colorBrandForegroundLinkHover: '#0E1620',
  colorBrandForegroundLinkPressed: '#0E1620',
  colorBrandForegroundLinkSelected: '#2C3E52',
  colorBrandForegroundOnLight: '#1F2B3A',
  colorBrandForegroundOnLightHover: '#2C3E52',
  colorBrandForegroundOnLightPressed: '#0E1620',
  colorBrandForegroundOnLightSelected: '#2C3E52',

  colorNeutralForeground2BrandHover: '#2C3E52',
  colorNeutralForeground2BrandPressed: '#0E1620',
  colorNeutralForeground2BrandSelected: '#2C3E52',
  colorNeutralForeground3BrandHover: '#2C3E52',
  colorNeutralForeground3BrandPressed: '#0E1620',
  colorNeutralForeground3BrandSelected: '#2C3E52',

  // ── Compound brand（Checkbox、Radio、Switch 内部）──
  colorCompoundBrandForeground1: '#1F2B3A',
  colorCompoundBrandForeground1Hover: '#2C3E52',
  colorCompoundBrandForeground1Pressed: '#0E1620',
  colorCompoundBrandBackground: '#1F2B3A',
  colorCompoundBrandBackgroundHover: '#2C3E52',
  colorCompoundBrandBackgroundPressed: '#0E1620',
  colorCompoundBrandStroke: '#1F2B3A',
  colorCompoundBrandStrokeHover: '#2C3E52',
  colorCompoundBrandStrokePressed: '#0E1620',

  // ── 品牌背景（Primary Button、选中态）──
  colorBrandBackground: '#1F2B3A',
  colorBrandBackgroundHover: '#2C3E52',
  colorBrandBackgroundPressed: '#0E1620',
  colorBrandBackgroundSelected: '#2C3E52',
  colorBrandBackgroundStatic: '#1F2B3A',
  colorBrandBackground2: '#F5EDE0',
  colorBrandBackground2Hover: '#EDE3D4',
  colorBrandBackground2Pressed: '#E7D4B6',
  colorBrandBackground3Static: '#2C3E52',
  colorBrandBackground4Static: '#0E1620',

  // ── 品牌反色 ──
  colorBrandForegroundInverted: '#E7D4B6',
  colorBrandForegroundInvertedHover: '#F0E6D6',
  colorBrandForegroundInvertedPressed: '#D4C4A6',
  colorBrandBackgroundInverted: '#FFFFFF',
  colorBrandBackgroundInvertedHover: '#F5EDE0',
  colorBrandBackgroundInvertedPressed: '#EDE3D4',
  colorBrandBackgroundInvertedSelected: '#E7D4B6',

  // ── Neutral on Brand（按钮上的文字/描边）──
  colorNeutralForegroundOnBrand: '#FFFFFF',
  colorNeutralStrokeOnBrand: '#FFFFFF',
  colorNeutralStrokeOnBrand2: '#FFFFFF',
  colorNeutralStrokeOnBrand2Hover: '#FFFFFF',
  colorNeutralStrokeOnBrand2Pressed: '#FFFFFF',
  colorNeutralStrokeOnBrand2Selected: '#FFFFFF',

  // ── 品牌描边 ──
  colorBrandStroke1: '#1F2B3A',
  colorBrandStroke2: '#C2CDD6',
  colorBrandStroke2Hover: '#9FB0BD',
  colorBrandStroke2Pressed: '#1F2B3A',
  colorBrandStroke2Contrast: '#C2CDD6',
};
