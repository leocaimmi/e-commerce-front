import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  @Output() closeCart = new EventEmitter<void>();

  cartItems = [
    {
      id: 1,
      name: 'Producto Premium 1',
      price: 99.99,
      quantity: 2,
      image: 'https://via.placeholder.com/80x80',
      size: 'M',
      color: 'Negro'
    },
    {
      id: 2,
      name: 'Producto Exclusivo 2',
      price: 149.99,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80',
      size: 'L',
      color: 'Blanco'
    },
    {
      id: 3,
      name: 'Producto Limitado 3',
      price: 79.99,
      quantity: 3,
      image: 'https://via.placeholder.com/80x80',
      size: 'S',
      color: 'Azul'
    }
  ];

  get totalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  onClose(): void {
    this.closeCart.emit();
  }

  updateQuantity(itemId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(itemId);
      }
    }
  }

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  proceedToCheckout(): void {
    console.log('Proceeding to checkout...');
    // Implementar lógica de checkout
  }
}
