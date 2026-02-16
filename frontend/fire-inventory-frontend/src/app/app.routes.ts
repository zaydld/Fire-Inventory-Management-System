import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login.page';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

import { ProductsPageComponent } from './pages/products.page';
import { ProductCreatePageComponent } from './pages/product-create.page';
import { ProductEditPageComponent } from './pages/product-edit.page';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'products', component: ProductsPageComponent },
      { path: 'products/new', component: ProductCreatePageComponent },
      { path: 'products/:id/edit', component: ProductEditPageComponent },

      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
