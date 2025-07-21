import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../../features/auth/pages/login/login.component';
import { CartComponent } from '../cart/cart.component';
import { FavoritesComponent } from '../favorites/favorites.component';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { NavbarModalService } from '../../services/navbar-modal.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatDialogModule, 
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    RouterModule,
    ThemeToggleComponent,
    SearchModalComponent,
    LoginComponent,
    CartComponent,
    FavoritesComponent,
    LogoutConfirmationComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  showLogin = false; // Nueva propiedad para mostrar/ocultar login
  showCart = false; // Nueva propiedad para mostrar/ocultar carrito
  showFavorites = false; // Nueva propiedad para mostrar/ocultar favoritos
  showLogoutConfirmation = false; // Nueva propiedad para mostrar/ocultar logout

  constructor(
    private dialog: MatDialog,
    private modalService: NavbarModalService,
    public authService: AuthService
  ) {}

  openSearch(): void {
    this.modalService.openModal('search');
  }

  openCart(): void {
    if (!this.authService.isLoggedIn) {
      this.openLogin();
      return;
    }
    this.showCart = true; // Mostrar carrito como componente
  }

  openFavorites(): void {
    if (!this.authService.isLoggedIn) {
      this.openLogin();
      return;
    }
    this.showFavorites = true; // Mostrar favoritos como componente
  }

  closeCart(): void {
    this.showCart = false; // Ocultar carrito
  }

  closeFavorites(): void {
    this.showFavorites = false; // Ocultar favoritos
  }

  openUserMenu(): void {
    if (!this.authService.isLoggedIn) {
      this.openLogin();
    } else {
      this.showLogoutConfirmation = true;
    }
  }

  onLogoutConfirm(): void {
    this.authService.logout();
    this.showLogoutConfirmation = false;
    console.log('User logged out');
  }

  onLogoutCancel(): void {
    this.showLogoutConfirmation = false;
  }

  openLogoutConfirmation(): void {
    const dialogRef = this.dialog.open(LogoutConfirmationComponent, {
      width: '400px',
      maxWidth: '90vw',
      hasBackdrop: true,
      disableClose: false,
      backdropClass: 'logout-backdrop',
      panelClass: 'logout-modal-panel',
      autoFocus: false,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.authService.logout();
        console.log('User logged out');
      }
    });
  }

  openLogin(): void {
    this.showLogin = true; // Mostrar componente en lugar de modal
  }

  closeLogin(): void {
    this.showLogin = false; // Ocultar componente
  }

  onLoginSuccess(): void {
    this.showLogin = false; // Cerrar login al completar
    console.log('Login successful, closing login component');
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
  }

  onNavLinkClick(): void {
    // Close mobile menu when a nav link is clicked
    this.closeMobileMenu();
  }
}