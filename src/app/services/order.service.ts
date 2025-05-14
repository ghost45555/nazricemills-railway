import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CartItem } from '../shared/services/cart.service';
import { environment } from '../../environments/environment';

export interface Address {
  id?: number;
  userId: number;
  address: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  packagingPhoto: string;
  weight: number;
  price: number;
  quantity: number;
}

export interface OrderData {
  userId?: number | null;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  phone: string;
  orderNotes?: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
}

export interface Order {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
  orderNotes?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  status: string;
  statusName: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private readonly SHIPPING_COST: number = 250; // Default shipping cost

  constructor(private http: HttpClient) {}

  // Create a new order
  createOrder(orderData: OrderData): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData)
      .pipe(
        catchError(error => {
          console.error('Error creating order:', error);
          throw error;
        })
      );
  }

  // Get a specific order by ID
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`)
      .pipe(
        catchError(error => {
          console.error(`Error getting order ${orderId}:`, error);
          throw error;
        })
      );
  }

  // Get orders for a logged-in user
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/customer`);
  }

  // Get an order by ID and email (for guest users)
  getOrderByIdAndEmail(orderId: string, email: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}?email=${encodeURIComponent(email)}`)
      .pipe(
        catchError(error => {
          console.error(`Error getting order ${orderId} with email:`, error);
          throw error;
        })
      );
  }

  // Create order items array from cart items
  createOrderItems(cartItems: CartItem[]): OrderItem[] {
    return cartItems.map(item => ({
      productId: item.id.split('-')[0], // Assuming ID format is "productId-weightValue"
      productName: item.name,
      productImage: item.image,
      packagingPhoto: item.packagingPhoto,
      weight: item.weight || 0,
      price: item.price,
      quantity: item.quantity
    }));
  }

  // Calculate order totals
  calculateOrderTotals(cartItems: CartItem[]): { subtotal: number, shipping: number, total: number } {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = this.SHIPPING_COST;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  }

  // Prepare order data from form and cart
  prepareOrderData(formData: any, cartItems: CartItem[], userId?: number): OrderData {
    const { subtotal, shipping, total } = this.calculateOrderTotals(cartItems);
    const orderItems = this.createOrderItems(cartItems);

    return {
      userId: userId || null,
      email: formData.contact.email,
      firstName: formData.delivery.firstName,
      lastName: formData.delivery.lastName,
      address: formData.delivery.address,
      apartment: formData.delivery.apartment,
      city: formData.delivery.city,
      postalCode: formData.delivery.postalCode,
      phone: formData.delivery.phone,
      orderNotes: formData.orderNotes,
      paymentMethod: formData.payment.method,
      subtotal,
      shipping,
      total,
      items: orderItems
    };
  }
} 