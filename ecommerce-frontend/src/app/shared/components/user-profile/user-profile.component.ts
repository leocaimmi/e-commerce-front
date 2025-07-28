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
import { UserService, UpdateUserRequest } from '../../../core/services/user.service';
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
  
  // Calendar properties
  showCalendar = false;
  maxDate = new Date(); // Today
  minDate = new Date(1900, 0, 1); // Jan 1, 1900
  selectedDateTemp: Date | null = null; // Temporary storage for selected date

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
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
    
    // Fetch user data from UserService to get the most up-to-date information
    this.userService.getCurrentUser().subscribe({
      next: (apiUser) => {
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
        const birthday = apiUser?.birthday ;
        if (birthday) {
          // Create date in local timezone to avoid UTC offset issues
          const date = this.createLocalDate(birthday);
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
            birthday: birthday ? this.createLocalDate(birthday) : null,
            profilePictureUrl: this.currentUser.avatar || ''
          });
        }
        
        // Reset image error when new data is loaded
        this.imageError = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.snackBar.open('Error al cargar los datos del usuario', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.showCalendar = false; // Start with calendar closed
    this.selectedDateTemp = null; // Clear temporary date
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.showCalendar = false; // Close calendar when canceling
    this.selectedDateTemp = null; // Clear temporary date
    this.loadUserData(); // Recargar datos originales
  }

  async onSaveProfile(): Promise<void> {
    console.log('onSaveProfile called - form valid:', this.profileForm.valid);
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      try {
        // Prepare data for API patch
        const formValue = this.profileForm.value;
        const updateData: UpdateUserRequest = {
          name: formValue.name.trim(),
          birthday: formValue.birthday instanceof Date 
            ? this.formatDateForAPI(formValue.birthday) // Use helper function for UTC-safe formatting
            : formValue.birthday,
          profilePictureUrl: formValue.profilePictureUrl?.trim() || ''
        };

        // Call the real API
        this.userService.updateCurrentUser(updateData).subscribe({
          next: (response) => {
            this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            this.isEditing = false;
            
            // Update current user data with response
            if (response.user) {
              this.currentUser = {
                ...this.currentUser,
                ...response.user,
                avatar: response.user.profilePictureUrl || response.user.avatar || ''
              };
            }
            
            // Reload data to ensure consistency
            this.loadUserData();
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            
            let errorMessage = 'Error al actualizar el perfil';
            
            if (error.type === 'NO_CHANGES') {
              errorMessage = 'No se realizaron cambios porque los datos son iguales a los actuales';
              this.snackBar.open(errorMessage, 'Cerrar', {
                duration: 4000,
                panelClass: ['warning-snackbar']
              });
            } else if (error.type === 'VALIDATION_ERROR') {
              errorMessage = 'Datos inválidos. Por favor, verifica los campos.';
              this.snackBar.open(errorMessage, 'Cerrar', {
                duration: 4000,
                panelClass: ['error-snackbar']
              });
            } else {
              this.snackBar.open(errorMessage, 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          },
          complete: () => {
            this.isSaving = false;
          }
        });
        
      } catch (error) {
        console.error('Unexpected error:', error);
        this.snackBar.open('Error inesperado al actualizar el perfil', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSaving = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
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

  /**
   * Toggle the inline calendar visibility
   */
  toggleCalendar(): void {
    if (this.isEditing) {
      if (!this.showCalendar) {
        // Opening calendar - set temporary date to current form value
        const currentValue = this.profileForm.get('birthday')?.value;
        this.selectedDateTemp = currentValue instanceof Date ? currentValue : null;
        this.showCalendar = true;
      } else {
        // Closing calendar
        this.showCalendar = false;
        this.selectedDateTemp = null;
      }
    }
  }

  /**
   * Close the inline calendar without applying changes
   */
  closeCalendar(): void {
    this.showCalendar = false;
    this.selectedDateTemp = null;
  }

  /**
   * Accept the selected date and close calendar
   */
  acceptDate(): void {
    console.log('acceptDate called with selectedDateTemp:', this.selectedDateTemp);
    if (this.selectedDateTemp) {
      this.profileForm.patchValue({
        birthday: this.selectedDateTemp
      });
      console.log('Form patched with birthday:', this.selectedDateTemp);
    }
    this.showCalendar = false;
    this.selectedDateTemp = null;
  }

  /**
   * Handle date selection from the inline calendar (store temporarily)
   * @param selectedDate Selected date from calendar
   */
  onDateSelected(selectedDate: Date): void {
    console.log('onDateSelected called with:', selectedDate);
    if (selectedDate) {
      this.selectedDateTemp = selectedDate;
      console.log('selectedDateTemp set to:', this.selectedDateTemp);
    }
  }

  /**
   * Get formatted birthday for display in input (dd/MM/yyyy format)
   * @returns Formatted date string
   */
  getFormattedBirthday(): string {
    const birthday = this.profileForm.get('birthday')?.value;
    console.log('getFormattedBirthday - birthday value:', birthday, 'type:', typeof birthday);
    
    if (birthday instanceof Date) {
      const day = String(birthday.getDate()).padStart(2, '0');
      const month = String(birthday.getMonth() + 1).padStart(2, '0');
      const year = birthday.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      console.log('Formatted date:', formatted);
      return formatted;
    }
    return '';
  }

  /**
   * Creates a date object from string without timezone conversion issues
   * @param dateString Date string from API (YYYY-MM-DD)
   * @returns Date object in local timezone
   */
  private createLocalDate(dateString: string): Date {
    if (!dateString) return new Date();
    
    // Parse YYYY-MM-DD manually to avoid UTC offset issues
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-based
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Fallback to regular Date constructor
    return new Date(dateString);
  }

  /**
   * Formats a Date object for API consumption without UTC issues
   * @param date Date object from date picker
   * @returns String in YYYY-MM-DD format
   */
  private formatDateForAPI(date: Date): string {
    if (!date) return '';
    
    // Use local date components to avoid UTC conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}
