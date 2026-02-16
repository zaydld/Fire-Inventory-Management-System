import { Component, HostListener } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';


import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { removeToken } from '../core/auth-token';

@Component({
  selector: 'app-main-layout',
  standalone: true,
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

      <!-- MENU -->
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
          <a mat-list-item routerLink="/products">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span>Products</span>
          </a>
        </mat-nav-list>

        <div class="p-4 mt-6">
          <button mat-stroked-button class="w-full" (click)="logout()">
            <mat-icon class="mr-2">logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <!-- CONTENU -->
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="ml-2">Fire Inventory</span>
        </mat-toolbar>

        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
})
export class MainLayoutComponent {
  isMobile = window.innerWidth < 768;

  constructor(private router: Router) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  logout(): void {
    removeToken();
    this.router.navigate(['/login']);
  }
}
