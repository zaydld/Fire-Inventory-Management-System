import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login.page';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

import { ProductsPageComponent } from './pages/products.page';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'products', component: ProductsPageComponent },

     

      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
