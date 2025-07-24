import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../../features/auth/pages/login/login.component';
import { RegisterComponent } from '../../../features/auth/pages/register/register.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { CartComponent } from '../cart/cart.component';
import { FavoritesComponent } from '../favorites/favorites.component';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { NavbarModalService } from '../../services/navbar-modal.service';
import { AuthService} from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/Auth-request';

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
    MatMenuModule,
    RouterModule,
    ThemeToggleComponent,
    SearchModalComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
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
  showRegister = false; // Nueva propiedad para mostrar/ocultar registro
  showProfile = false; // Nueva propiedad para mostrar/ocultar perfil
  showCart = false; // Nueva propiedad para mostrar/ocultar carrito
  showFavorites = false; // Nueva propiedad para mostrar/ocultar favoritos
  showLogoutConfirmation = false; // Nueva propiedad para mostrar/ocultar logout
  imageError = false; // Nueva propiedad para manejar errores de imagen

  constructor(
    private dialog: MatDialog,
    private modalService: NavbarModalService,
    public authService: AuthService
  ) {}

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  openSearch(): void {
    this.modalService.openModal('search');
  }

  openCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.openLogin();
      return;
    }
    this.showCart = true; // Mostrar carrito como componente
  }

  openFavorites(): void {
    if (!this.authService.isAuthenticated()) {
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
    if (!this.authService.isAuthenticated()) {
      this.openLogin();
    } else {
      this.showProfile = true;
    }
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  openLogoutMenu(): void {
    this.showLogoutConfirmation = true;
  }

  onLogoutConfirm(): void {
    this.authService.logOut();
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
        this.authService.logOut();
        console.log('User logged out');
      }
    });
  }

  openLogin(): void {
    this.showLogin = true; // Mostrar componente en lugar de modal
    this.showRegister = false; // Ocultar registro si está abierto
  }

  closeLogin(): void {
    this.showLogin = false; // Ocultar componente
  }

  onLoginSuccess(): void {
    this.showLogin = false; // Cerrar login al completar
    console.log('Login successful, closing login component');
  }

  // Métodos para el registro
  openRegister(): void {
    this.showRegister = true;
    this.showLogin = false; // Ocultar login si está abierto
  }

  closeRegister(): void {
    this.showRegister = false;
  }

  onRegisterSuccess(): void {
    this.showRegister = false;
    console.log('Register successful, closing register component');
  }

  // Cambiar entre login y registro
  switchToRegister(): void {
    this.showLogin = false;
    this.showRegister = true;
  }

  switchToLogin(): void {
    this.showRegister = false;
    this.showLogin = true;
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

  onImageError(): void {
    this.imageError = true;
  }
}