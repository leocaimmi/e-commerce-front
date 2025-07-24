import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

/**
 * Guard para verificar si el usuario está autenticado
 * @returns true si el usuario está autenticado, false y redirección a unauthorized en caso contrario
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Redirigir directamente a la página unauthorized en lugar de a login
    router.navigate(['/auth/unauthorized'], { 
      queryParams: { 
        reason: 'authentication_required',
        message: 'Necesitas iniciar sesión para acceder a esta sección.',
        // Opcionalmente, guardar la URL a la que intentaba acceder
        redirectUrl: state.url
      }
    });
    return false;
  }
};