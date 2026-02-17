import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANG_KEY = 'app-lang';
export type AppLang = 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = (localStorage.getItem(LANG_KEY) as AppLang | null) ?? 'en';
    this.translate.setDefaultLang('en');
    this.use(saved);
  }

  get(): AppLang {
    return (this.translate.currentLang as AppLang) || 'en';
  }

  use(lang: AppLang): void {
    this.translate.use(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  toggle(): void {
    this.use(this.get() === 'en' ? 'fr' : 'en');
  }
}
