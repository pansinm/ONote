import { makeAutoObservable, runInAction } from 'mobx';
import i18next from '../i18n';
import settingService from '../services/settingService';
import { getLogger } from '/@/shared/logger';
import type { SupportedLocale } from '/@/shared/i18n';
import { DEFAULT_LOCALE, isValidLocale, detectSystemLocale } from '/@/shared/i18n';

const logger = getLogger('I18nStore');

class I18nStore {
  currentLanguage: SupportedLocale = DEFAULT_LOCALE;
  initialized = false;

  constructor() {
    this.init();
    makeAutoObservable(this);
  }

  private async init() {
    try {
      const allSettings = await settingService.getAll() as Record<string, unknown>;
      const savedLang = (allSettings['app.language'] as string | undefined) || '';

      let targetLang: SupportedLocale;

      if (savedLang && isValidLocale(savedLang)) {
        targetLang = savedLang;
      } else {
        targetLang = detectSystemLocale();
        await settingService.update('app.language', targetLang);
      }

      runInAction(() => {
        this.currentLanguage = targetLang;
        this.initialized = true;
      });

      await i18next.changeLanguage(targetLang);

      logger.info('I18n initialized', { language: targetLang });
    } catch (error) {
      logger.error('Failed to initialize i18n', error);
      runInAction(() => {
        this.initialized = true;
      });
    }
  }

  async setLanguage(lang: SupportedLocale) {
    if (!isValidLocale(lang)) {
      logger.warn('Invalid language', { lang });
      return;
    }

    try {
      await settingService.update('app.language', lang);
      await i18next.changeLanguage(lang);

      runInAction(() => {
        this.currentLanguage = lang;
      });

      logger.info('Language changed', { language: lang });
    } catch (error) {
      logger.error('Failed to change language', error);
    }
  }
}

export default I18nStore;