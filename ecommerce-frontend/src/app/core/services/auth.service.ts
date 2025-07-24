import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../interfaces/Auth-request';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly URL_BASE: string = `${environment.apiUrl}api/v1/auth`;
  private http: HttpClient = inject(HttpClient);
  private tokenExpirationTimer: any;

  // BehaviorSubject para mantener el estado de autenticación observable
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private router: Router) {
    // Verificar el token al iniciar el servicio
    this.checkTokenValidity();
  }

  /**
   * Realiza la petición de login al backend
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del login
   */
  postLogin(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = {
      username: email,
      password: password
    };

    return this.http.post<LoginResponse>(`${this.URL_BASE}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.logIn(response.token);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          throw error;
        })
      );
  }

  /**
   * Almacena el token en localStorage y actualiza el estado de autenticación
   * @param token Token JWT
   */
  logIn(token: string): void {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);

    // Configurar temporizador para logout automático cuando expire el token
    this.setAutoLogout(token);
  }

  /**
   * Elimina el token y actualiza el estado de autenticación
   */
  logOut(): void {
    //localStorage.removeItem('token');
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);

    // Limpiar el temporizador si existe
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    this.router.navigate(['/']);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Login con credenciales para compatibilidad
   */
  async loginWithCredentials(email: string, password: string): Promise<boolean> {
    try {
      const response = await this.postLogin(email, password).toPromise();
      return !!response?.token;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  /**
   * Inicia el proceso de autenticación con Google OAuth
   * Redirige al usuario al endpoint de OAuth del backend
   */
  loginWithGoogle(): void {
    const googleOAuthUrl = `${environment.apiUrl}oauth2/authorization/google`;
    window.location.href = googleOAuthUrl;
  }

  /**
   * Inicia el proceso de registro con Google OAuth
   * Redirige al usuario al endpoint de OAuth del backend
   */
  registerWithGoogle(): void {
    // Usamos el mismo endpoint ya que Google OAuth puede servir tanto para login como registro
    const googleOAuthUrl = `${environment.apiUrl}oauth2/authorization/google`;
    window.location.href = googleOAuthUrl;
  }

  /**
   * Observable que emite el estado de autenticación
   * @returns Observable<boolean>
   */
  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Obtiene el token almacenado
   * @returns El token o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene el rol del usuario desde el token
   * @returns El rol del usuario o null si no existe
   */
  getRolUsuario(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const roles = decodedToken.roles;
        if (roles && roles.length > 0) {
          return roles[0].authority || null;
        }
        return null;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param allowedRoles Array de roles permitidos
   * @returns true si el usuario tiene alguno de los roles permitidos
   */
  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getRolUsuario();
    return userRole !== null && allowedRoles.includes(userRole);
  }

  /**
   * Obtiene el email del usuario desde el token
   * @returns El email del usuario o null si no existe
   */
  getEmailUsuario(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.sub || null;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Retrieves the username from the stored JWT token.
   *
   * Decodes the JWT token and extracts the `username` property if available.
   * Returns `null` if the token is missing, invalid, or does not contain a username.
   *
   * @returns The username as a string, or `null` if not available.
   */
  getName(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.name || null;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtiene todos los datos del usuario desde el token
   * @returns Datos del usuario o null si no existe el token
   */
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (token && this.hasValidToken()) {
      try {
        const decodedToken: any = jwtDecode(token);
        return {
          id: decodedToken.userId || decodedToken.sub || 'unknown',
          name: decodedToken.name || 'Usuario',
          email: decodedToken.sub || decodedToken.email || '',
          avatar: decodedToken.profilePictureUrl || decodedToken.avatar || ''
        };
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtiene la fecha de cumpleaños del usuario desde el token
   * @returns Fecha de cumpleaños o null si no existe
   */
  getUserBirthday(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.birthday || null;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtiene datos del usuario desde la API usando el email del token
   * @returns Observable con los datos del usuario
   */
  getUserFromAPI(): Observable<User | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.email) {
      return of(null);
    }

    const encodedEmail = encodeURIComponent(currentUser.email);
    return this.http.get<User>(`${environment.apiUrl}api/v1/users?email=${encodedEmail}`)
      .pipe(
        tap(user => {
          console.log('User data from API:', user);
        }),
        catchError(error => {
          console.error('Error fetching user from API:', error);
          return of(null);
        })
      );
  }

  /**
   * Verifica si el token es válido (no expirado y con estructura correcta)
   * @returns true si el token es válido
   */
  isTokenValid(): boolean {
    return this.hasValidToken();
  }
  /**
   * Obtiene la fecha de expiración del token
   * @param token Token JWT
   * @returns Fecha de expiración o null si no existe
   */
  private getTokenExpirationDate(token: string): Date | null {
    try {
      const decodedToken: any = jwtDecode(token);

      if (!decodedToken.exp) {
        return null;
      }

      // La fecha de expiración viene en segundos, convertir a milisegundos
      return new Date(decodedToken.exp * 1000);
    } catch (error) {
      console.error('Error al obtener fecha de expiración:', error);
      return null;
    }
  }

  /**
   * Configura el temporizador para logout automático
   * @param token Token JWT
   */
  private setAutoLogout(token: string): void {
    const expirationDate = this.getTokenExpirationDate(token);

    if (!expirationDate) {
      return;
    }

    // Calcular tiempo hasta expiración
    const expiresIn = expirationDate.getTime() - new Date().getTime();

    // Si ya expiró, hacer logout
    if (expiresIn <= 0) {
      this.logOut();
      return;
    }

    // Configurar temporizador
    this.tokenExpirationTimer = setTimeout(() => {
      this.logOut();
    }, expiresIn);
  }

  /**
   * Verifica si hay un token y si es válido
   * @returns true si hay un token válido
   */
  private hasValidToken(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }

  /**
   * Verifica el token al iniciar el servicio
   */
  private checkTokenValidity(): void {
    const token = this.getToken();

    if (token) {
      const expirationDate = this.getTokenExpirationDate(token);

      if (expirationDate && expirationDate > new Date()) {
        // Token válido, configurar logout automático
        this.setAutoLogout(token);
        this.isAuthenticatedSubject.next(true);
      } else {
        // Token expirado, hacer logout
        this.logOut();
      }
    }
  }

  /**
   * Realiza el registro de un nuevo usuario
   * @param registerData Datos del registro
   * @returns Promise<boolean> indicando si el registro fue exitoso
   */
  async register(registerData: RegisterRequest): Promise<boolean> {
    try {
      const response = await this.http.post<LoginResponse>(`${this.URL_BASE}/register`, registerData).toPromise();
      
      if (response && response.token) {
        this.logIn(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  }


}
