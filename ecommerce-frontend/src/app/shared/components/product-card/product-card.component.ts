import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Product } from '../../../core/interfaces/Product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showAddToCart: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();
  @Output() toggleFavorite = new EventEmitter<Product>();

  // Track image loading state
  imageError = false;
  imageLoading = true;
  
  // Track favorite state
  isFavorite = false;

  onAddToCart(): void {
    if (this.product && !this.isLoading) {
      this.addToCart.emit(this.product);
    }
  }

  onViewDetails(): void {
    if (this.product) {
      this.viewDetails.emit(this.product);
    }
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation(); // Prevent card click events
    if (this.product && !this.isLoading) {
      this.isFavorite = !this.isFavorite;
      this.toggleFavorite.emit(this.product);
    }
  }

  getCategoryIcon(categoryName: string | undefined): string {
    if (!categoryName) return 'category';
    
    const categoryIcons: { [key: string]: string } = {
      'Electronics': 'devices',
      'Clothing': 'checkroom',
      'Books': 'menu_book',
      'Home & Garden': 'home',
      'Sports': 'sports_soccer',
      'Beauty': 'face',
      'Toys': 'toys',
      'Food': 'restaurant',
      'Health': 'health_and_safety',
      'Automotive': 'directions_car'
    };
    return categoryIcons[categoryName] || 'category';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  getStockStatus(): { text: string; class: string } {
    if (this.product.stock === 0) {
      return { text: 'Sin stock', class: 'out-of-stock' };
    } else if (this.product.stock <= 5) {
      return { text: 'Pocas unidades', class: 'low-stock' };
    } else {
      return { text: 'En stock', class: 'in-stock' };
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !this.imageError) {
      this.imageError = true;
      this.imageLoading = false;
      img.src = '/assets/images/no-image.svg';
    }
  }

  onImageLoad(): void {
    this.imageLoading = false;
  }

  getImageUrl(): string {
    if (this.imageError) {
      return '/assets/images/no-image.svg';
    }
    return this.product.imageUrl || '/assets/images/no-image.svg';
  }
}
