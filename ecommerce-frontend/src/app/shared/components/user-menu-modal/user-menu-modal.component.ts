import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';

export interface UserMenuData {
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

@Component({
  selector: 'app-user-menu-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatRippleModule
  ],
  templateUrl: './user-menu-modal.component.html',
  styleUrl: './user-menu-modal.component.css'
})
export class UserMenuModalComponent {
  isLoggedIn: boolean = false;
  userName: string = 'Guest User';
  userEmail: string = '';
  userAvatar: string = '';

  constructor(
    public dialogRef: MatDialogRef<UserMenuModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserMenuData
  ) {
    if (data) {
      this.isLoggedIn = data.isLoggedIn || false;
      this.userName = data.userName || 'Guest User';
      this.userEmail = data.userEmail || '';
      this.userAvatar = data.userAvatar || '';
    }
  }

  onSignIn(): void {
    this.dialogRef.close({ action: 'signin' });
  }

  onSignUp(): void {
    this.dialogRef.close({ action: 'signup' });
  }

  onProfile(): void {
    this.dialogRef.close({ action: 'profile' });
  }

  onSettings(): void {
    this.dialogRef.close({ action: 'settings' });
  }

  onOrders(): void {
    this.dialogRef.close({ action: 'orders' });
  }

  onWishlist(): void {
    this.dialogRef.close({ action: 'wishlist' });
  }

  onLogout(): void {
    this.dialogRef.close({ action: 'logout' });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
