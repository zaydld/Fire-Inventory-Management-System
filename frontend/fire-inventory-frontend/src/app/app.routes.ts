import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login.page';
import { authGuard } from './core/auth.guard';

// (temporaire) on met Health pour tester, plus tard on remplacera par Products pages
import { HealthPageComponent } from './pages/health.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginPageComponent },

  // ✅ Protected routess
  {
    path: 'products',
    canActivate: [authGuard],
    children: [
      { path: '', component: HealthPageComponent },          // /products
      { path: 'new', component: HealthPageComponent },       // /products/new (temp)
      { path: ':id/edit', component: HealthPageComponent },  // /products/:id/edit (temp)
    ],
  },

  { path: '**', redirectTo: 'login' },
];
