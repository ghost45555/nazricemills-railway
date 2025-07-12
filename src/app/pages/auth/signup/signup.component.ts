import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, RegisterPayload } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';

@Component({
    selector: 'app-signup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showError = false;

  // Order linking
  orderId: string | null = null;
  orderEmail: string | null = null;
  showOrderInfo = false;
  orderDetails: any = null;
  saveAddress = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check for order info in URL parameters
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order'] || null;
      this.orderEmail = params['email'] || null;

      if (this.orderId && this.orderEmail) {
        // Pre-fill the email field
        this.signupForm.get('email')?.setValue(this.orderEmail);

        // Fetch order details to show
        this.fetchOrderDetails();
      } else {
        // Check local storage for pending signup (from checkout)
        const pendingSignup = localStorage.getItem('pendingSignup');
        if (pendingSignup) {
          try {
            const signupData = JSON.parse(pendingSignup);
            this.orderId = signupData.orderId;
            this.orderEmail = signupData.email;
            
            if (this.orderEmail) {
              this.signupForm.get('email')?.setValue(this.orderEmail);
            }
            
            if (this.orderId && this.orderEmail) {
              this.fetchOrderDetails();
            }
          } catch (error) {
            console.error('Error parsing pending signup data:', error);
          }
        }
      }
    });
  }

  // Password match validator
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Fetch order details
  fetchOrderDetails(): void {
    if (!this.orderId || !this.orderEmail) return;

    this.orderService.getOrderByIdAndEmail(this.orderId, this.orderEmail)
      .subscribe({
        next: (order) => {
          this.orderDetails = order;
          this.showOrderInfo = true;

          // Pre-fill form fields from order
          if (order.firstName) this.signupForm.get('firstName')?.setValue(order.firstName);
          if (order.lastName) this.signupForm.get('lastName')?.setValue(order.lastName);
          if (order.phone) this.signupForm.get('phone')?.setValue(order.phone);
        },
        error: (error) => {
          console.error('Error fetching order:', error);
          this.showOrderInfo = false;
        }
      });
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Submit form
  onSubmit(): void {
    if (this.signupForm.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.signupForm.get('password')?.value !== this.signupForm.get('confirmPassword')?.value) {
      this.showErrorMessage('Passwords do not match');
      return;
    }

    this.isSubmitting = true;
    this.showError = false;

    const userData: RegisterPayload = {
      email: this.signupForm.get('email')?.value,
      password: this.signupForm.get('password')?.value,
      firstName: this.signupForm.get('firstName')?.value,
      lastName: this.signupForm.get('lastName')?.value,
      phone: this.signupForm.get('phone')?.value,
      orderId: this.orderId || undefined,
      saveAddress: this.saveAddress
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        // Clean up any pending signup data
        localStorage.removeItem('pendingSignup');
        
        // Redirect to account page or orders page
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showErrorMessage(error.error?.message || 'An error occurred during registration. Please try again.');
      }
    });
  }

  // Show error message
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }
} 