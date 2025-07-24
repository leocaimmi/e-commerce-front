import { Component, inject, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<LoginComponent>, { optional: true });

  // Eventos para uso como componente standalone
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeLogin = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  rememberMe = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Removemos validación de email para permitir "leo"
      password: ['', [Validators.required, Validators.minLength(3)]] // Reducimos mínimo a 3 para "123"
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        
        // Intentar login con credenciales
        const success = await this.authService.loginWithCredentials(email, password);
        
        if (success) {
          // Cerrar modal si existe, o emitir evento si es componente standalone
          if (this.dialogRef) {
            this.dialogRef.close();
          } else {
            this.loginSuccess.emit();
          }
        } else {
          this.errorMessage = 'Credenciales incorrectas. Usa: leo / 123';
        }
        
      } catch (error: any) {
        this.errorMessage = error.message || 'Error al iniciar sesión';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Redirigir directamente al endpoint de Google OAuth del backend
      this.authService.loginWithGoogle();
      
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con Google';
      this.isLoading = false;
    }
  }

  onClose(): void {
    // Cerrar modal si existe, o emitir evento si es componente standalone
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.closeLogin.emit();
    }
  }

  openSignup(): void {
    this.switchToRegister.emit();
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El usuario es requerido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 3 caracteres';
    }
    return '';
  }
}
