import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService} from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/Auth-request';

@Component({
  selector: 'app-user-profile',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Output() closeProfile = new EventEmitter<void>();

  currentUser: User | null = null;
  userRole: string = '';
  userBirthday: string = '';
  memberSince: string = '';
  imageError: boolean = false;
  isEditing = false;
  isSaving = false;
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      birthday: ['', [Validators.required]],
      profilePictureUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userRole = this.authService.getRolUsuario() || 'Usuario';
    
    // Fetch user data from API to get the most up-to-date information
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
      
      // Cache birthday and member since to avoid infinite loops
      const birthday = apiUser?.birthday || this.authService.getUserBirthday();
      if (birthday) {
        const date = new Date(birthday);
        this.userBirthday = date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long' 
        });
      } else {
        this.userBirthday = 'No especificado';
      }
      
      // Calculate member since date (you can implement this based on your needs)
      this.memberSince = new Date().getFullYear().toString();
      
      if (this.currentUser) {
        this.profileForm.patchValue({
          name: this.currentUser.name,
          birthday: birthday ? new Date(birthday) : null,
          profilePictureUrl: this.currentUser.avatar || ''
        });
      }
      
      // Reset image error when new data is loaded
      this.imageError = false;
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserData(); // Recargar datos originales
  }

  async onSaveProfile(): Promise<void> {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      try {
        // Aquí podrías hacer una llamada al backend para actualizar el perfil
        // Por ahora simulamos la actualización
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.isEditing = false;
        // Aquí podrías actualizar el token local o recargar los datos del usuario
        
      } catch (error) {
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isSaving = false;
      }
    }
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Aquí podrías implementar la subida de archivo
      // Por ahora solo mostramos un mensaje
      this.snackBar.open('Funcionalidad de subida de imagen próximamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  onClose(): void {
    this.closeProfile.emit();
  }
}
