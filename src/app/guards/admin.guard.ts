import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin().pipe(
    take(1), // On prend juste la valeur actuelle et on complète
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        // Redirection vers la page de login si non autorisé
        return router.createUrlTree(['/admin-login']);
      }
    })
  );
};
