import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Address } from '../../services/order.service';

interface CheckoutFormData {
  contact: {
    email: string;
  };
  delivery: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode?: string;
    phone: string;
  };
  payment: {
    method: string;
  };
  saveInfo: boolean;
  saveAddress?: boolean;
  setDefaultAddress?: boolean;
  selectedAddressId?: number | null;
}

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  isSubmitting = false;
  cartItems: CartItem[] = [];
  readonly SHIPPING_COST: number = 250;
  orderNotes: string = '';
  isLoggedIn = false;
  savedAddresses: Address[] = [];
  useNewAddress = true;
  selectedAddressId: number | null = null;
  lastOrderId: string | null = null;
  lastOrderEmail: string | null = null;
  showOrderSuccess = false;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      }),
      delivery: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        apartment: [''],
        city: ['', [Validators.required]],
        postalCode: [''],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]]
      }),
      payment: this.fb.group({
        method: ['cod', Validators.required]
      }),
      saveInfo: [false],
      saveAddress: [false],
      setDefaultAddress: [false],
      selectedAddressId: [null]
    });
  }
  savedNotes: string | null = null;
  ngOnInit(): void {
    // Check if user is logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.loadSavedAddresses();
        this.prefillFormWithUserData();
      }
    });

    // Load saved information if available
    const savedInfo = localStorage.getItem('checkoutInfo');
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      this.checkoutForm.patchValue(parsedInfo);
    }

    // Subscribe to cart items
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    // Load order notes if available
    this.savedNotes = localStorage.getItem('orderNotes');
    if (this.savedNotes) {
      this.orderNotes = this.savedNotes;
    }
  }

  prefillFormWithUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const contactGroup = this.checkoutForm.get('contact');
      const deliveryGroup = this.checkoutForm.get('delivery');

      if (contactGroup && currentUser.email) {
        contactGroup.patchValue({ email: currentUser.email });
      }

      if (deliveryGroup) {
        if (currentUser.firstName) deliveryGroup.patchValue({ firstName: currentUser.firstName });
        if (currentUser.lastName) deliveryGroup.patchValue({ lastName: currentUser.lastName });
        if (currentUser.phone) deliveryGroup.patchValue({ phone: currentUser.phone });
      }
    }
  }

  loadSavedAddresses(): void {
    this.authService.getSavedAddresses().subscribe(addresses => {
      this.savedAddresses = addresses;
      
      // If there's a default address, select it
      const defaultAddress = addresses.find(address => address.isDefault);
      if (defaultAddress) {
        this.selectAddress(defaultAddress.id);
      }
    });
  }

  selectAddress(addressId: number): void {
    if (addressId === undefined) return;
    
    this.selectedAddressId = addressId;
    this.useNewAddress = false;
    this.checkoutForm.patchValue({ selectedAddressId: addressId });
    
    // Find the selected address
    const selectedAddress = this.savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress && this.checkoutForm.get('delivery')) {
      // Fill the form with the address details
      this.checkoutForm.get('delivery')?.patchValue({
        address: selectedAddress.address,
        apartment: selectedAddress.apartment || '',
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode || ''
      });
      
      // Disable the form fields when using a saved address
      if (!this.useNewAddress) {
        this.checkoutForm.get('delivery.address')?.disable();
        this.checkoutForm.get('delivery.apartment')?.disable();
        this.checkoutForm.get('delivery.city')?.disable();
        this.checkoutForm.get('delivery.postalCode')?.disable();
      }
    }
  }

  useNewAddressForm(): void {
    this.useNewAddress = true;
    this.selectedAddressId = null;
    this.checkoutForm.patchValue({ selectedAddressId: null });
    
    // Enable the address form fields
    this.checkoutForm.get('delivery.address')?.enable();
    this.checkoutForm.get('delivery.apartment')?.enable();
    this.checkoutForm.get('delivery.city')?.enable();
    this.checkoutForm.get('delivery.postalCode')?.enable();
    
    // Clear the address fields
    this.checkoutForm.get('delivery')?.patchValue({
      address: '',
      apartment: '',
      city: '',
      postalCode: ''
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && this.cartItems.length > 0) {
      this.isSubmitting = true;
      
      const formData: CheckoutFormData = this.checkoutForm.getRawValue(); // getRawValue includes disabled controls
      
      // Save information if user opted in
      if (formData.saveInfo) {
        localStorage.setItem('checkoutInfo', JSON.stringify(formData));
      }
      
      // Save order notes if any
      if (this.orderNotes) {
        localStorage.setItem('orderNotes', this.orderNotes);
      }
      
      // Prepare order data
      const userId = this.isLoggedIn ? this.authService.getCurrentUser()?.id : undefined;
      let orderData = this.orderService.prepareOrderData({
        ...formData,
        orderNotes: this.orderNotes
      }, this.cartItems, userId);

      // Create the order
      this.orderService.createOrder(orderData).subscribe({
        next: (createdOrder) => {
          console.log('Order created successfully:', createdOrder);
          this.lastOrderId = createdOrder.id;
          this.lastOrderEmail = createdOrder.email;
          
          // If user is logged in and wants to save the address
          if (this.isLoggedIn && this.useNewAddress && formData.saveAddress) {
            this.saveNewAddress(formData);
          }
          
          // Clear cart
          this.cartService.clearCart();
          
          // Show success message and handle redirection
          this.showOrderSuccess = true;
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating order:', error);
          alert('Failed to place your order. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  saveNewAddress(formData: CheckoutFormData): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    const addressData: Address = {
      userId: currentUser.id,
      address: formData.delivery.address,
      apartment: formData.delivery.apartment,
      city: formData.delivery.city,
      postalCode: formData.delivery.postalCode,
      isDefault: formData.setDefaultAddress
    };
    
    this.authService.saveAddress(addressData).subscribe({
      next: (savedAddress) => {
        console.log('Address saved successfully:', savedAddress);
        // Reload addresses to show the new one
        this.loadSavedAddresses();
      },
      error: (error) => {
        console.error('Error saving address:', error);
      }
    });
  }

  redirectToSignup(): void {
    if (this.lastOrderId && this.lastOrderEmail) {
      this.router.navigate(['/signup'], { 
        queryParams: { 
          order: this.lastOrderId, 
          email: this.lastOrderEmail 
        } 
      });
    } else {
      this.router.navigate(['/signup']);
    }
  }

  viewOrderDetails(): void {
    if (!this.lastOrderId) return;
    
    if (this.isLoggedIn) {
      // For now, just redirect to home with an alert since we don't have order tracking page yet
      this.router.navigate(['/my-orders']);
    } else {
      // For guest users, redirect to login with the order ID in query params
      this.router.navigate(['/login'], { 
        queryParams: { 
          redirect: '/order-tracking',
          email: this.lastOrderEmail,
          order: this.lastOrderId
        } 
      });
    }
  }

  closeModal(): void {
    this.showOrderSuccess = false;
    
    // After closing the modal, we will check if the user wants to continue shopping
    // or should be redirected to signup/login
    if (!this.isLoggedIn) {
      // Ask user if they want to create an account now
      if (confirm('Would you like to create an account to track your orders?')) {
        this.redirectToSignup();
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(control: any): string {
    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotal(): number {
    return this.getSubtotal() + this.SHIPPING_COST;
  }

  getOriginalPrice(item: CartItem): number | null {
    const productId = item.id.split('-')[0];
    const product = this.productService.getProductById(productId);
    if (product?.hasDiscount && product.discountPercentage) {
      return item.price / (1 - product.discountPercentage / 100);
    }
    return null;
  }

  getDiscountAmount(item: CartItem): number | null {
    const originalPrice = this.getOriginalPrice(item);
    if (originalPrice) {
      return originalPrice - item.price;
    }
    return null;
  }

  getTotalDiscount(): number {
    return this.cartItems.reduce((total, item) => {
      const discount = this.getDiscountAmount(item);
      return total + (discount ? discount * item.quantity : 0);
    }, 0);
  }
} 