export type SupportedLocale = 'zh-CN' | 'en-US';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['zh-CN', 'en-US'];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';

export interface LocaleResource {
  [key: string]: string | LocaleResource;
}