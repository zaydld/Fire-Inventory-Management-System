import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { removeToken } from '../core/auth-token';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  styles: [`
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
          Fire Inventory
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
            <span class="text-gray-900 dark:text-white font-medium">Products</span>
        </a>
    </mat-nav-list>

        <div class="p-4 mt-6">
          <button mat-stroked-button class="w-full" (click)="logout()">
            <mat-icon class="mr-2">logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <!-- CONTENT -->
      <mat-sidenav-content>

        <mat-toolbar color="primary">
          <button mat-icon-button (click)="toggleDrawer()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="ml-2">Fire Inventory</span>

          <span class="flex-1"></span>

          <!-- Theme toggle -->
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

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // applique le thème sauvegardé
    this.themeService.initTheme();

    // sync icône
    this.isDark = this.themeService.get() === 'dark';
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;

    // si on passe desktop, garder le menu ouvert
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

  logout(): void {
    removeToken();
    this.router.navigate(['/login']);
  }
}
