import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getToken } from './auth-token';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = getToken();

  if (token) return true;

  return router.createUrlTree(['/login']);
};
