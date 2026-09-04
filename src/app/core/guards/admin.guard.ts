import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CurrentUserResponse } from '../models/auth/res-current-user.model';

const isAdmin = (user: CurrentUserResponse | null): boolean =>
  (user?.roleCode ?? '').includes('ADMIN');

/**
 * Blocks /admin/* for anyone without an ADMIN role. `authService.user` is
 * only populated after app.ts's initial getCurrentUser() call resolves, so a
 * hard refresh/direct link straight into /admin can hit this guard before
 * that finishes - re-fetch in that case rather than trusting an empty signal.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.user();

  if (currentUser) {
    return isAdmin(currentUser) ? true : router.createUrlTree(['/401']);
  }

  if (!authService.getToken()) {
    return router.createUrlTree(['/401']);
  }

  return authService.getCurrentUser().pipe(
    map(res => {
      const user = res.data ?? null;
      authService.user.set(user);

      return isAdmin(user) ? true : router.createUrlTree(['/401']);
    }),
    catchError(() => of(router.createUrlTree(['/401'])))
  );
};
