/**
 * ONote 墨与纸 — 主题管理
 *
 * 提供 useOnoteTheme hook，根据用户偏好返回亮色/暗色 Fluent UI 主题，
 * 并同步 data-theme 属性到 <html>。
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Theme } from '@fluentui/react-components';
import { onoteLightTheme } from './onoteLightTheme';
import { onoteDarkTheme } from './onoteDarkTheme';

export type Appearance = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'onote-appearance';

function getStoredAppearance(): Appearance {
  return (localStorage.getItem(STORAGE_KEY) as Appearance) || 'system';
}

function resolveIsDark(appearance: Appearance): boolean {
  if (appearance === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return appearance === 'dark';
}

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
  }
}

export function useOnoteTheme() {
  const [appearance, setAppearanceState] = useState<Appearance>(getStoredAppearance);
  const [systemIsDark, setSystemIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // 监听系统主题变化
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = appearance === 'system' ? systemIsDark : appearance === 'dark';

  // 同步 data-theme 属性
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const setAppearance = useCallback((value: Appearance) => {
    setAppearanceState(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const theme: Theme = useMemo(() => (isDark ? onoteDarkTheme : onoteLightTheme), [isDark]);

  return { theme, appearance, setAppearance, isDark };
}

// 初始化时立即应用（避免闪烁）
const initialAppearance = getStoredAppearance();
applyTheme(resolveIsDark(initialAppearance));

export { onoteLightTheme, onoteDarkTheme };
