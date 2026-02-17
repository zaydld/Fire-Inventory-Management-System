import { Injectable } from '@angular/core';

const THEME_KEY = 'app-theme';
export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private get root(): HTMLElement {
    return document.documentElement; // <html>
  }

  initTheme(): void {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? 'light';
    this.set(saved);
  }

  toggle(): void {
    const next: ThemeMode = this.get() === 'dark' ? 'light' : 'dark';
    this.set(next);
  }

  get(): ThemeMode {
    return this.root.classList.contains('dark') ? 'dark' : 'light';
  }

  private set(theme: ThemeMode): void {
    this.root.classList.toggle('dark', theme === 'dark'); // Tailwind / global
    localStorage.setItem(THEME_KEY, theme);
  }
}
