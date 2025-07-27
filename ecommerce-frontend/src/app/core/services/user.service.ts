import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../interfaces/Auth-request';

export interface UpdateUserRequest {
  name: string;
  birthday: string;
  profilePictureUrl: string;
}

export interface UserUpdateResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private readonly BASE_URL = `${environment.apiUrl}api/v1/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del usuario actual desde la API
   * @returns Observable con los datos del usuario
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/me`)
      .pipe(
        tap(user => {
          console.log('Current user from API:', user);
        }),
        catchError(this.handleError)
      );
  }


  /**
   * Actualiza los datos del usuario actual
   * @param userData Datos del usuario a actualizar
   * @returns Observable con la respuesta de la actualización
   */
  updateCurrentUser(userData: UpdateUserRequest): Observable<UserUpdateResponse> {
    return this.http.patch<User>(`${this.BASE_URL}/me`, userData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating user:', error);
          
          // Manejar diferentes códigos de estado
          if (error.status === 409) {
            return throwError(() => ({
              status: 409,
              message: 'No se realizaron cambios porque los datos son iguales a los actuales.',
              type: 'NO_CHANGES'
            }));
          }
          
          if (error.status === 400) {
            return throwError(() => ({
              status: 400,
              message: 'Datos inválidos. Por favor, verifica los campos.',
              type: 'VALIDATION_ERROR'
            }));
          }
          
          return throwError(() => ({
            status: error.status || 500,
            message: 'Error al actualizar el usuario. Inténtalo nuevamente.',
            type: 'UNKNOWN_ERROR'
          }));
        }),
        // Transformar respuesta exitosa
        tap(updatedUser => {
          console.log('User updated successfully:', updatedUser);
        }),
        // Mapear a UserUpdateResponse
        map(updatedUser => ({
          success: true,
          message: 'Usuario actualizado correctamente',
          user: updatedUser
        }))
      );
  }

  /**
   * Maneja errores HTTP comunes
   * @param error Error HTTP
   * @returns Observable con error procesado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado.';
          break;
        case 409:
          errorMessage = 'Los datos no se modificaron porque son iguales a los actuales.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    
    console.error('UserService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
