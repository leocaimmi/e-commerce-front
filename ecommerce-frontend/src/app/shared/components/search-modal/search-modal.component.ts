import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil } from 'rxjs';
import { NavbarModalService } from '../../services/navbar-modal.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  searchQuery = '';
  isVisible = false;
  private destroy$ = new Subject<void>();

  constructor(private modalService: NavbarModalService) {}

  ngOnInit(): void {
    this.modalService.activeModal$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(activeModal => {
      this.isVisible = activeModal === 'search';
      if (this.isVisible && this.searchInput) {
        setTimeout(() => this.searchInput.nativeElement.focus(), 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.modalService.closeModal();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Aquí implementarías la lógica de búsqueda
      this.modalService.closeModal();
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.searchInput.nativeElement.focus();
  }
}
