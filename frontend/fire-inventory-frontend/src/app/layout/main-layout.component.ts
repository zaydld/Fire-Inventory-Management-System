import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { removeToken } from '../core/auth-token';
import { ThemeService } from '../core/theme.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  styles: [`
    /* Force couleur texte des items (Material list) */
    ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
      color: #111827 !important;
    }
    ::ng-deep html.dark .mat-mdc-list-item .mdc-list-item__primary-text {
      color: #ffffff !important;
    }
  `],
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen" autosize>

      <!-- SIDENAV -->
      <mat-sidenav
        #drawer
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        class="w-60"
      >
        <div class="p-4 font-semibold text-lg">
          {{ 'APP.TITLE' | translate }}
        </div>

        <mat-nav-list>
          <a
            routerLink="/products"
            (click)="closeIfMobile()"
            class="flex items-center gap-3 px-4 py-3 rounded-lg mx-2
                   text-gray-900 dark:text-white
                   hover:bg-gray-100 dark:hover:bg-slate-700
                   transition-colors"
          >
            <mat-icon class="text-gray-900 dark:text-white">inventory_2</mat-icon>
            <span class="text-gray-900 dark:text-white font-medium">
              {{ 'MENU.PRODUCTS' | translate }}
            </span>
          </a>
        </mat-nav-list>

        <div class="p-4 mt-6">
          <button mat-stroked-button class="w-full" (click)="logout()">
            <mat-icon class="mr-2">logout</mat-icon>
            {{ 'MENU.LOGOUT' | translate }}
          </button>
        </div>
      </mat-sidenav>

      <!-- CONTENT -->
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="toggleDrawer()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="ml-2">{{ 'APP.TITLE' | translate }}</span>

          <span class="flex-1"></span>

          <!-- ✅ Language switch -->
          <button
            mat-button
            (click)="toggleLang()"
            class="lang-btn font-semibold"
          >
            {{ lang.toUpperCase() }}
          </button>

          <!-- ✅ Theme toggle -->
          <button
            mat-icon-button
            (click)="toggleTheme()"
            aria-label="Toggle theme"
            class="text-white"
          >
            <mat-icon>{{ isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </mat-toolbar>

        <div class="p-6">
          <router-outlet></router-outlet>
        </div>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  isMobile = window.innerWidth < 768;
  isDark = false;

  // ✅ langue affichée dans le bouton (EN/FR)
  lang: 'en' | 'fr' = 'en';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    // ✅ Theme
    this.themeService.initTheme();
    this.isDark = this.themeService.get() === 'dark';

    // ✅ Lang (init + sync)
    this.i18n.init();
    this.lang = this.i18n.get();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;

    if (!this.isMobile && this.drawer) {
      this.drawer.open();
    }
  }

  toggleDrawer(): void {
    if (this.drawer) this.drawer.toggle();
  }

  closeIfMobile(): void {
    if (this.isMobile && this.drawer) this.drawer.close();
  }

  toggleTheme(): void {
    this.themeService.toggle();
    this.isDark = this.themeService.get() === 'dark';
  }

  toggleLang(): void {
    this.i18n.toggle();
    this.lang = this.i18n.get();
  }

  logout(): void {
    removeToken();
    this.router.navigate(['/login']);
  }
}
