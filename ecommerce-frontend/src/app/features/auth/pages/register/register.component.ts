import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/interfaces/Auth-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Output() registerSuccess = new EventEmitter<void>();
  @Output() closeRegister = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      birthday: ['', [Validators.required]],
      profilePictureUrl: ['']
    });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const formValue = this.registerForm.value;
      const registerData: RegisterRequest = {
        name: formValue.name,
        birthday: this.formatDate(formValue.birthday),
        email: formValue.email,
        password: formValue.password,
        phoneNumber: formValue.phoneNumber,
        role: 'CLIENT'
      };

      // Solo agregar profilePictureUrl si tiene valor
      if (formValue.profilePictureUrl && formValue.profilePictureUrl.trim()) {
        registerData.profilePictureUrl = formValue.profilePictureUrl;
      }

      try {
        const success = await this.authService.register(registerData);
        if (success) {
          this.snackBar.open('¡Registro exitoso! Bienvenido.', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.onRegisterSuccess();
        } else {
          this.snackBar.open('Error en el registro. Intenta nuevamente.', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        console.error('Error durante el registro:', error);
        this.snackBar.open('Error en el registro. Intenta nuevamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onGoogleRegister() {
    // Usar el método del AuthService para redirigir a Google OAuth
    this.authService.registerWithGoogle();
  }

  onRegisterSuccess() {
    // Emitir evento para cerrar el modal o navegar
    this.registerSuccess.emit();
  }

  onCloseRegister() {
    this.closeRegister.emit();
  }

  goToLogin() {
    this.switchToLogin.emit();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // formato YYYY-MM-DD
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validaciones
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get birthday() { return this.registerForm.get('birthday'); }
  get profilePictureUrl() { return this.registerForm.get('profilePictureUrl'); }
}
