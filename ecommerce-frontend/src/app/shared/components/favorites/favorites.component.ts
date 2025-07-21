import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  @Output() closeFavorites = new EventEmitter<void>();

  favoriteItems = [
    {
      id: 1,
      name: 'Producto Favorito 1',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://via.placeholder.com/150x150',
      discount: 20,
      inStock: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Producto Deseado 2',
      price: 89.99,
      originalPrice: null,
      image: 'https://via.placeholder.com/150x150',
      discount: 0,
      inStock: true,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Producto Exclusivo 3',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://via.placeholder.com/150x150',
      discount: 25,
      inStock: false,
      rating: 4.2
    },
    {
      id: 4,
      name: 'Producto Premium 4',
      price: 79.99,
      originalPrice: null,
      image: 'https://via.placeholder.com/150x150',
      discount: 0,
      inStock: true,
      rating: 4.7
    }
  ];

  get totalItems(): number {
    return this.favoriteItems.length;
  }

  onClose(): void {
    this.closeFavorites.emit();
  }

  removeFromFavorites(itemId: number): void {
    this.favoriteItems = this.favoriteItems.filter(item => item.id !== itemId);
  }

  addToCart(item: any): void {
    console.log('Adding to cart:', item);
    // Implementar lógica para agregar al carrito
  }

  viewProduct(item: any): void {
    console.log('Viewing product:', item);
    // Implementar navegación al producto
  }

  generateStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    
    if (hasHalfStar) {
      stars.push('star_half');
    }
    
    while (stars.length < 5) {
      stars.push('star_border');
    }
    
    return stars;
  }
}
