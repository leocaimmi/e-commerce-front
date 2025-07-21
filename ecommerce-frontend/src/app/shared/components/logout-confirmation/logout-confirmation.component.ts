import { Component, Output, EventEmitter, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logout-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './logout-confirmation.component.html',
  styleUrl: './logout-confirmation.component.css'
})
export class LogoutConfirmationComponent {
  // Para uso como componente standalone
  @Output() confirmLogout = new EventEmitter<void>();
  @Output() cancelLogout = new EventEmitter<void>();

  constructor(
    @Optional() private matDialogRef: MatDialogRef<LogoutConfirmationComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    if (this.matDialogRef) {
      this.matDialogRef.close(true);
    } else {
      this.confirmLogout.emit();
    }
  }

  onCancel(): void {
    if (this.matDialogRef) {
      this.matDialogRef.close(false);
    } else {
      this.cancelLogout.emit();
    }
  }
}
