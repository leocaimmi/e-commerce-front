import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

/**
 * Guard para verificar si el usuario tiene los roles necesarios
 * @param allowedRoles Array de roles permitidos
 * @returns función que implementa CanActivateFn
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Verificar si el usuario tiene alguno de los roles permitidos
    const userRole = authService.getRolUsuario();
    
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    
    return false;
  };
};