import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Login con credenciales
  loginWithCredentials(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Usuario de prueba: leo / 123
      if (email.toLowerCase() === 'leo' && password === '123') {
        const userData: User = {
          id: '1',
          name: 'Leo',
          email: 'leo@test.com',
          avatar: ''
        };
        this.login(userData);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  login(userData: User): void {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  // Demo login for testing
  demoLogin(): void {
    const demoUser: User = {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com'
    };
    this.login(demoUser);
  }
}
