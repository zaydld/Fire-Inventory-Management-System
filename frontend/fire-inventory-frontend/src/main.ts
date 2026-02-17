import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ThemeService } from './app/core/theme.service';

// ✅ Appliquer le thème sauvegardé avant bootstrap
new ThemeService().initTheme();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
