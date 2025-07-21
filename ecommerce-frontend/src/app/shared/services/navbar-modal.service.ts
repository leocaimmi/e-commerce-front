import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NavbarModalType = 'search' | 'cart' | 'favorites' | 'user' | null;

@Injectable({
  providedIn: 'root'
})
export class NavbarModalService {
  private activeModalSubject = new BehaviorSubject<NavbarModalType>(null);
  public activeModal$ = this.activeModalSubject.asObservable();

  openModal(type: NavbarModalType): void {
    // Si ya está abierto el mismo modal, lo cerramos
    if (this.activeModalSubject.value === type) {
      this.closeModal();
    } else {
      this.activeModalSubject.next(type);
    }
  }

  closeModal(): void {
    this.activeModalSubject.next(null);
  }

  isModalOpen(type: NavbarModalType): boolean {
    return this.activeModalSubject.value === type;
  }

  get activeModal(): NavbarModalType {
    return this.activeModalSubject.value;
  }
}
