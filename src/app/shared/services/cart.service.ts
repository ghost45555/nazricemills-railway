import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  packagingPhoto: string;
  weight?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartTotal = new BehaviorSubject<number>(0);

  constructor() {
    // Load cart from localStorage on service initialization (only in browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
        this.updateTotal();
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartTotal(): Observable<number> {
    return this.cartTotal.asObservable();
  }

  addToCart(item: CartItem): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { ...item, quantity: 1 }]);
    }

    this.updateTotal();
    this.saveCart();
  }

  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems.value;
    this.cartItems.next(currentItems.filter(item => item.id !== itemId));
    this.updateTotal();
    this.saveCart();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(itemId);
      } else {
        this.cartItems.next([...currentItems]);
        this.updateTotal();
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    this.updateTotal();
    this.saveCart();
  }

  private updateTotal(): void {
    const total = this.cartItems.value.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    this.cartTotal.next(total);
  }

  private saveCart(): void {
    // Only save to localStorage in browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    }
  }
} 