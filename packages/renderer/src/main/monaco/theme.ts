/**
 * ONote 墨与纸 — Monaco Editor 自定义主题
 *
 * 亮色（onote-light）：纸色底 + 墨色字
 * 暗色（onote-dark）：墨色底 + 纸色字
 *
 * 颜色与 index.scss 的 CSS 变量保持一致。
 */

import * as monaco from 'monaco-editor';

// ── 亮色主题 ──
const lightColors: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Markdown 语法
    { token: 'keyword.md', foreground: '1F2B3A' },           // #, **, [], 等
    { token: 'string.md', foreground: '3D5168' },            // 链接文本
    { token: 'variable.md', foreground: '2C6B8A' },          // 链接 URL
    { token: 'keyword.control.md', foreground: '1F2B3A' },   // ---
    { token: 'comment', foreground: '9FB0BD' },              // HTML 注释
    { token: 'string', foreground: '3A7D44' },               // 代码
    { token: 'keyword', foreground: '1F2B3A' },              // 通用 keyword
    { token: 'number', foreground: '2C3E52' },               // 数字
    { token: 'type', foreground: '2C6B8A' },                 // 类型
    { token: '', foreground: '3D5168' },                      // 默认文字
  ],
  colors: {
    'editor.background': '#FFFCF5',               // --paper-50
    'editor.foreground': '#3D5168',               // --text-body (--ink-600)
    'editorLineNumber.foreground': '#9FB0BD',     // --ink-300 (柔和)
    'editorLineNumber.activeForeground': '#556B7E', // --ink-500
    'editor.lineHighlightBackground': '#F5EDE033', // --paper-200 低透明度
    'editor.selectionBackground': '#C2CDD644',    // --ink-200 半透明
    'editor.inactiveSelectionBackground': '#E0E7ED33', // --ink-100 半透明
    'editorCursor.foreground': '#1F2B3A',         // --ink-800
    'editorWhitespace.foreground': '#E0E7ED',     // --ink-100
    'editorIndentGuide.background': '#E0E7ED55',  // --ink-100
    'editorIndentGuide.activeBackground': '#C2CDD688', // --ink-200
    'editor.findMatchBackground': '#F6D98D44',    // --highlight-bg
    'editor.findMatchHighlightBackground': '#F6D98D22',
    'editorOverviewRuler.border': '#E0E7ED00',    // 透明
    'editorGutter.background': '#FFFCF5',         // 同背景
    'editor.selectionHighlightBackground': '#C2CDD622',
    'minimap.background': '#FFFCF5',
  },
};

// ── 暗色主题 ──
const darkColors: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Markdown 语法
    { token: 'keyword.md', foreground: 'E7D4B6' },           // #, **, [], 等
    { token: 'string.md', foreground: 'D4C4A6' },            // 链接文本
    { token: 'variable.md', foreground: '5BA3C9' },          // 链接 URL (--info)
    { token: 'keyword.control.md', foreground: 'E7D4B6' },   // ---
    { token: 'comment', foreground: '5C5545' },              // --ink-300
    { token: 'string', foreground: '52B765' },               // --success
    { token: 'keyword', foreground: 'E7D4B6' },              // 通用 keyword
    { token: 'number', foreground: 'F0E6D6' },               // --ink-700
    { token: 'type', foreground: '5BA3C9' },                 // --info
    { token: '', foreground: 'D4C4A6' },                      // 默认文字 (--ink-600)
  ],
  colors: {
    'editor.background': '#0E1620',               // --paper-50
    'editor.foreground': '#D4C4A6',               // --text-body (--ink-600)
    'editorLineNumber.foreground': '#5C5545',     // --ink-300 (柔和)
    'editorLineNumber.activeForeground': '#8A8886', // --ink-400
    'editor.lineHighlightBackground': '#1A253533', // --paper-200 低透明度
    'editor.selectionBackground': '#3A322888',    // --ink-200 半透明
    'editor.inactiveSelectionBackground': '#2A242033', // --ink-100 半透明
    'editorCursor.foreground': '#E7D4B6',         // --ink-800 → paper
    'editorWhitespace.foreground': '#2A2420',     // --ink-100
    'editorIndentGuide.background': '#2A242055',  // --ink-100
    'editorIndentGuide.activeBackground': '#3A322888', // --ink-200
    'editor.findMatchBackground': '#F6D98D22',    // --highlight-bg 低透明
    'editor.findMatchHighlightBackground': '#F6D98D11',
    'editorOverviewRuler.border': '#2A242000',    // 透明
    'editorGutter.background': '#0E1620',         // 同背景
    'editor.selectionHighlightBackground': '#3A322822',
    'minimap.background': '#0E1620',
  },
};

/** 注册所有自定义主题（在 app 启动时调用一次） */
export function registerMonacoThemes() {
  monaco.editor.defineTheme('onote-light', lightColors);
  monaco.editor.defineTheme('onote-dark', darkColors);
}

/** 根据 data-theme 返回对应的 Monaco theme name */
export function getMonacoThemeName(): string {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'onote-dark' : 'onote-light';
}
