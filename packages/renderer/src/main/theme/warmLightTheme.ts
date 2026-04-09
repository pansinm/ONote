/**
 * Paper & Ink 暖色主题
 *
 * 覆盖 Fluent UI webLightTheme 的品牌色令牌，
 * 将微软蓝系 (#0f6cbd) 替换为墨/琥珀暖色系。
 */

import { webLightTheme } from '@fluentui/react-components';
import type { Theme } from '@fluentui/react-components';

// ── 暖色阶梯 ──────────────────────────────────────────
//
//  蓝色              → 暖色              用途
//  ─────────────────────────────────────────────
//  #0f6cbd (brand)   → #7a6b52          主品牌色
//  #115ea3 (hover)   → #6b5c44          hover
//  #0f548c (press)   → #5c4d38          pressed / selected
//  #0c3b5e (deep)    → #4a3f35          深色
//  #0a2e4a (darkest) → #3a3228          最深
//  #0e4775           → #504430          pressed on light
//  #ebf3fc (bg2)     → #f0ebe0          浅底
//  #cfe4fa (bg2-h)   → #e8e0d0          浅底 hover
//  #96c6fa (bg2-p)   → #d4c9b8          浅底 pressed
//  #b4d6fa (str2)    → #c8bfaf          描边浅
//  #77b7f7 (str2-h)  → #b8ad9e          描边浅 hover
//  #479ef5 (inv)     → #a09080          反色
//  #62abf5 (inv-h)   → #b0a08f          反色 hover
//

export const warmLightTheme: Theme = {
  ...webLightTheme,

  // ── 品牌前景色（文字、链接）──
  colorBrandForeground1: '#7a6b52',
  colorBrandForeground2: '#6b5c44',
  colorBrandForeground2Hover: '#5c4d38',
  colorBrandForeground2Pressed: '#3a3228',
  colorBrandForegroundLink: '#7a6b52',
  colorBrandForegroundLinkHover: '#5c4d38',
  colorBrandForegroundLinkPressed: '#4a3f35',
  colorBrandForegroundLinkSelected: '#6b5c44',
  colorBrandForegroundOnLight: '#7a6b52',
  colorBrandForegroundOnLightHover: '#6b5c44',
  colorBrandForegroundOnLightPressed: '#504430',
  colorBrandForegroundOnLightSelected: '#5c4d38',

  colorNeutralForeground2BrandHover: '#6b5c44',
  colorNeutralForeground2BrandPressed: '#5c4d38',
  colorNeutralForeground2BrandSelected: '#6b5c44',
  colorNeutralForeground3BrandHover: '#6b5c44',
  colorNeutralForeground3BrandPressed: '#5c4d38',
  colorNeutralForeground3BrandSelected: '#6b5c44',

  // ── Compound brand（Checkbox、Radio、Switch 内部）──
  colorCompoundBrandForeground1: '#7a6b52',
  colorCompoundBrandForeground1Hover: '#6b5c44',
  colorCompoundBrandForeground1Pressed: '#5c4d38',
  colorCompoundBrandBackground: '#7a6b52',
  colorCompoundBrandBackgroundHover: '#6b5c44',
  colorCompoundBrandBackgroundPressed: '#5c4d38',
  colorCompoundBrandStroke: '#7a6b52',
  colorCompoundBrandStrokeHover: '#6b5c44',
  colorCompoundBrandStrokePressed: '#5c4d38',

  // ── 品牌背景（Primary Button、选中态）──
  colorBrandBackground: '#7a6b52',
  colorBrandBackgroundHover: '#6b5c44',
  colorBrandBackgroundPressed: '#4a3f35',
  colorBrandBackgroundSelected: '#5c4d38',
  colorBrandBackgroundStatic: '#7a6b52',
  colorBrandBackground2: '#f0ebe0',
  colorBrandBackground2Hover: '#e8e0d0',
  colorBrandBackground2Pressed: '#d4c9b8',
  colorBrandBackground3Static: '#5c4d38',
  colorBrandBackground4Static: '#4a3f35',

  // ── 品牌反色（在深色背景上的元素）──
  colorBrandForegroundInverted: '#a09080',
  colorBrandForegroundInvertedHover: '#b0a08f',
  colorBrandForegroundInvertedPressed: '#a09080',
  colorBrandBackgroundInverted: '#ffffff',
  colorBrandBackgroundInvertedHover: '#f0ebe0',
  colorBrandBackgroundInvertedPressed: '#d4c9b8',
  colorBrandBackgroundInvertedSelected: '#e8e0d0',

  // ── Neutral on Brand（按钮上的文字/描边，保持白色）──
  colorNeutralForegroundOnBrand: '#ffffff',
  colorNeutralStrokeOnBrand: '#ffffff',
  colorNeutralStrokeOnBrand2: '#ffffff',
  colorNeutralStrokeOnBrand2Hover: '#ffffff',
  colorNeutralStrokeOnBrand2Pressed: '#ffffff',
  colorNeutralStrokeOnBrand2Selected: '#ffffff',

  // ── 品牌描边 ──
  colorBrandStroke1: '#7a6b52',
  colorBrandStroke2: '#c8bfaf',
  colorBrandStroke2Hover: '#b8ad9e',
  colorBrandStroke2Pressed: '#7a6b52',
  colorBrandStroke2Contrast: '#c8bfaf',

  // ── Focus 描边（至关重要：键盘导航时的聚焦环）──
  // Fluent 非品牌 focus token 保持不变即可，暖色已通过 colorBrandStroke1 覆盖
};
