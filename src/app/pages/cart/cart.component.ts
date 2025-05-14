import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  totalDiscount: number = 0;
  readonly SHIPPING_COST: number = 250;
  orderNotes: string = '';

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateDiscount();
    });

    this.cartService.getCartTotal().subscribe(total => {
      this.total = total;
    });

    // Load saved order notes if available
    const savedNotes = localStorage.getItem('orderNotes');
    if (savedNotes) {
      this.orderNotes = savedNotes;
    }
  }

  get subtotal(): number {
    return this.total;
  }

  get totalWithShipping(): number {
    return this.total + this.SHIPPING_COST;
  }

  private calculateDiscount(): void {
    this.totalDiscount = this.cartItems.reduce((total, item) => {
      const product = this.productService.getProductById(item.id.split('-')[0]);
      if (product?.hasDiscount && product.discountPercentage) {
        const originalPrice = item.price / (1 - product.discountPercentage / 100);
        return total + (originalPrice - item.price) * item.quantity;
      }
      return total;
    }, 0);
  }

  getOriginalPrice(item: CartItem): number | null {
    const product = this.productService.getProductById(item.id.split('-')[0]);
    if (product?.hasDiscount && product.discountPercentage) {
      return item.price / (1 - product.discountPercentage / 100);
    }
    return null;
  }

  updateQuantity(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  updateOrderNotes(): void {
    if (this.orderNotes.length > 300) {
      this.orderNotes = this.orderNotes.slice(0, 300);
    }
    // Save order notes to localStorage
    localStorage.setItem('orderNotes', this.orderNotes);
  }
} 