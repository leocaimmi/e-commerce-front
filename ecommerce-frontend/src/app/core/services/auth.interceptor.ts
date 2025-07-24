import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

/**
 * Interceptor para añadir el token de autenticación a las peticiones HTTP
 * y manejar errores de autenticación/autorización
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
    
  const token = authService.getToken();
  
  // Si hay token, añadirlo a la solicitud
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Procesar la respuesta y manejar errores de autenticación
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized) { // 401
          console.error('Error 401: Sesión expirada o token inválido');
          authService.logOut(); // Limpia el token
          
        } 
        else if (error.status === HttpStatusCode.Forbidden) { // 403
          console.error('Error 403: Acceso denegado - Permisos insuficientes');
          

        }
        
        return throwError(() => error);
      })
    );
  }
  
  // Si no hay token, pasar la petición sin modificar
  return next(req);
};