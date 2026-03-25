import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth     = inject(AuthService);
  const router   = inject(Router);
  const required = route.data['roles'] as string[];
  const userRole = auth.currentUser()?.rol;

  if (!required || !required.length) return true;
  if (userRole && required.includes(userRole)) return true;

  router.navigate(['/forbidden']);
  return false;
};
