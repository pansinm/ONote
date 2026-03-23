import type { SupportedLocale, LocaleResource } from './types';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './types';

import zhCNCommon from './locales/zh-CN/common.json';
import zhCNMenu from './locales/zh-CN/menu.json';
import zhCNSetting from './locales/zh-CN/setting.json';
import zhCINSidebar from './locales/zh-CN/sidebar.json';
import zhCNLlmbox from './locales/zh-CN/llmbox.json';

import enUSCommon from './locales/en-US/common.json';
import enUSMenu from './locales/en-US/menu.json';
import enUSSetting from './locales/en-US/setting.json';
import enUSSidebar from './locales/en-US/sidebar.json';
import enUSLlmbox from './locales/en-US/llmbox.json';

export const resources: Record<SupportedLocale, Record<string, LocaleResource>> = {
  'zh-CN': {
    common: zhCNCommon,
    menu: zhCNMenu,
    setting: zhCNSetting,
    sidebar: zhCINSidebar,
    llmbox: zhCNLlmbox,
  },
  'en-US': {
    common: enUSCommon,
    menu: enUSMenu,
    setting: enUSSetting,
    sidebar: enUSSidebar,
    llmbox: enUSLlmbox,
  },
};

export function detectSystemLocale(): SupportedLocale {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language;

  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }

  return 'en-US';
}

export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export type { SupportedLocale, LocaleResource };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE };