import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { removeToken, getToken } from './core/auth-token';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
})
export class App {
  showToolbar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        // Cache la toolbar sur /login
        this.showToolbar = this.router.url !== '/login';
      });
  }

  logout(): void {
    removeToken();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!getToken();
  }
}
