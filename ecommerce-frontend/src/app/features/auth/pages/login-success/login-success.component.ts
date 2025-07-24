import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../core/interfaces/Auth-request';

@Component({
  selector: 'app-login-success',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="login-success-container">
      <div class="success-card">
        <div class="success-header">
          <div class="check-animation">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h2 class="success-title">¡Autenticación Exitosa!</h2>
          <p class="success-subtitle">Bienvenido de vuelta</p>
        </div>
        
        <div class="loading-section" *ngIf="isProcessing">
          <mat-spinner diameter="32"></mat-spinner>
          <p class="loading-text">Completando autenticación...</p>
        </div>
        
        <div class="user-welcome" *ngIf="!isProcessing && currentUser">
          <div class="user-avatar">
            <img *ngIf="currentUser.avatar && !imageError; else defaultAvatar" 
                 [src]="currentUser.avatar" 
                 [alt]="currentUser.name"
                 (error)="onImageError()">
            <ng-template #defaultAvatar>
              <div class="default-avatar-container">
                <mat-icon class="default-avatar-icon">account_circle</mat-icon>
              </div>
            </ng-template>
          </div>
          <h3>Hola, {{currentUser.name}}!</h3>
          <p class="user-email">{{currentUser.email}}</p>
        </div>
        
        <div class="redirect-info">
          <mat-icon>home</mat-icon>
          <span>Redirigiendo al inicio...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .success-card {
      background: white;
      padding: 3rem 2rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      text-align: center;
      max-width: 400px;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .success-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .success-header {
      margin-bottom: 2rem;
    }

    .check-animation {
      margin: 0 auto 1.5rem;
      width: 80px;
      height: 80px;
    }

    .checkmark {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: block;
      stroke-width: 2;
      stroke: #4CAF50;
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px #4CAF50;
      animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    }

    .checkmark__circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 2;
      stroke-miterlimit: 10;
      stroke: #4CAF50;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark__check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes fill {
      100% {
        box-shadow: inset 0px 0px 0px 30px #4CAF50;
      }
    }

    .success-title {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .success-subtitle {
      color: #7f8c8d;
      font-size: 1rem;
      margin: 0;
    }

    .loading-section {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.02);
      }
      100% {
        transform: scale(1);
      }
    }

    .loading-text {
      margin-top: 1rem;
      color: #666;
      font-weight: 500;
      animation: fadeInOut 1.5s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0%, 100% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
    }

    .user-welcome {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      border: 1px solid #dee2e6;
      animation: fadeInUp 0.6s ease-out 0.3s both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-avatar {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .default-avatar-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .default-avatar-icon {
      font-size: 35px !important;
      width: 35px !important;
      height: 35px !important;
      color: white;
    }

    .user-welcome h3 {
      color: #2c3e50;
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .user-email {
      color: #6c757d;
      font-size: 0.95rem;
      margin: 0;
    }

    .redirect-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #667eea;
      font-weight: 500;
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
    }

    .redirect-info mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    @media (max-width: 480px) {
      .success-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }
      
      .success-title {
        font-size: 1.5rem;
      }
      
      .check-animation {
        width: 60px;
        height: 60px;
      }
      
      .checkmark {
        width: 60px;
        height: 60px;
      }
    }
  `]
})
export class LoginSuccessComponent implements OnInit {
  
  isProcessing = true;
  currentUser: User | null = null;
  imageError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.handleLoginSuccess();
  }

  private handleLoginSuccess(): void {
    // Extraer el token de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        try {
          // Almacenar el token usando el AuthService
          this.authService.logIn(token);
          
          // Verificar que el token sea válido
          if (this.authService.isTokenValid()) {
            // Obtener datos del usuario desde el token primero
            this.currentUser = this.authService.getCurrentUser();
            
            // Luego obtener datos actualizados desde la API
            this.authService.getUserFromAPI().subscribe(apiUser => {
              if (apiUser) {
                // Merge token data with API data, preferring API data
                this.currentUser = {
                  ...this.currentUser,
                  ...apiUser,
                  // Use profilePictureUrl from API as avatar
                  avatar: apiUser.profilePictureUrl || apiUser.avatar || ''
                };
              }
              
              // Reset image error when new data is loaded
              this.imageError = false;
            });
            
            // Mostrar mensaje de éxito
            this.snackBar.open('¡Autenticación exitosa con Google!', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            // Esperar un momento para mostrar la información del usuario
            setTimeout(() => {
              this.isProcessing = false;
            }, 1500);
            
            // Redirigir al dashboard o página principal
            setTimeout(() => {
              this.router.navigate(['/']); // o la ruta que desees
            }, 4000);
          } else {
            this.handleError('Token inválido o expirado');
          }
          
        } catch (error) {
          console.error('Error al procesar el token:', error);
          this.handleError('Error al procesar la autenticación');
        }
      } else {
        this.handleError('No se recibió el token de autenticación');
      }
    });
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    
    // Redirigir al login después de mostrar el error
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  onImageError(): void {
    this.imageError = true;
  }
}
