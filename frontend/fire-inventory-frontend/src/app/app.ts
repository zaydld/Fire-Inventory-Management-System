import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { removeToken, getToken } from './core/auth-token';

// ✅ ngx-translate
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  showToolbar = true;

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        // Cache la toolbar sur /login
        this.showToolbar = this.router.url !== '/login';
      });
  }

  ngOnInit(): void {
    // ✅ US-12.1: Default EN
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  logout(): void {
    removeToken();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!getToken();
  }
}
