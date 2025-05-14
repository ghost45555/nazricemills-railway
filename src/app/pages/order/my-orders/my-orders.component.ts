import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Order } from '../../../services/order.service';
import { OrderService } from '../../../services/order.service';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Safe reference to Bootstrap
declare let bootstrap: any;

interface StatusToast {
  id: number;
  message: string;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  statusToasts: StatusToast[] = [];
  private orderModal: any;
  private pollingSubscription?: Subscription;
  private nextToastId = 1;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check login status
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.currentUser = this.authService.getCurrentUser();
        this.loadOrders();
        this.startOrderPolling();
      } else {
        // User is not logged in, show login message briefly then redirect
        this.orders = [];
        this.isLoading = false;
        
        // Wait a moment to show the login message, then redirect
        setTimeout(() => {
          this.router.navigate(['login'], { 
            queryParams: { returnUrl: 'my-orders' }
          });
        }, 3000);
      }
    });

    // Initialize Bootstrap modal immediately and on DOM load
    this.initializeModal();
    
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeModal();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Load orders from API
  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        // Sort orders by date (newest first)
        this.orders = orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  // Start polling for order updates
  startOrderPolling(): void {
    this.pollingSubscription = interval(this.POLL_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getUserOrders())
      )
      .subscribe({
        next: (updatedOrders) => this.checkOrderUpdates(updatedOrders),
        error: (error) => console.error('Error polling orders:', error)
      });
  }

  // Check for order updates and show notifications
  checkOrderUpdates(updatedOrders: Order[]): void {
    // First run - just set orders
    if (this.orders.length === 0) {
      // Sort orders by date (newest first)
      this.orders = updatedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return;
    }

    // Check for status changes
    const statusChanges: { orderId: string, oldStatus: string, newStatus: string }[] = [];

    updatedOrders.forEach(newOrder => {
      const oldOrder = this.orders.find(o => o.id === newOrder.id);
      if (!oldOrder) {
        // New order
        this.showToast(`New order #${newOrder.id} has been placed.`);
      } else if (oldOrder.statusName !== newOrder.statusName) {
        // Status changed
        statusChanges.push({
          orderId: newOrder.id,
          oldStatus: oldOrder.statusName || oldOrder.status || 'Processing',
          newStatus: newOrder.statusName || newOrder.status || 'Processing'
        });
      }
    });

    // Show notifications for status changes
    statusChanges.forEach(change => {
      this.showToast(`Order #${change.orderId} status updated to ${change.newStatus}`);
    });

    // Update orders list if there are any changes
    if (statusChanges.length > 0 || this.orders.length !== updatedOrders.length) {
      // Sort orders by date (newest first)
      this.orders = updatedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  // Show toast notification
  showToast(message: string): void {
    const toast: StatusToast = {
      id: this.nextToastId++,
      message
    };
    this.statusToasts.push(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast);
    }, 5000);
  }

  // Remove toast
  removeToast(toast: StatusToast): void {
    this.statusToasts = this.statusToasts.filter(t => t.id !== toast.id);
  }

  // Get order items consistently
  getOrderItems(order: Order): any[] {
    return order.orderItems || order.items || [];
  }

  // Get item count consistently
  getItemCount(order: Order): number {
    return (order.orderItems || order.items || []).length;
  }

  // View order details
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    
    // Ensure the modal is initialized
    const modalElement = document.getElementById('orderDetailsModal');
    if (!modalElement) {
      console.error('Modal element not found');
      return;
    }
    
    try {
      // Create or retrieve the Bootstrap modal instance
      if (!this.orderModal && typeof bootstrap !== 'undefined') {
        this.orderModal = new bootstrap.Modal(modalElement, {
          backdrop: false, // We're handling the backdrop with CSS
          keyboard: true,
          focus: true
        });
        
        // Set up close button handler for the new cross icon
        const closeButton = modalElement.querySelector('.modal-close-btn');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.orderModal.hide();
          });
        }
      }
      
      // Show the modal - use Bootstrap if available, fallback to manual display
      if (this.orderModal) {
        // Apply animations
        document.body.classList.add('modal-open');
        modalElement.style.display = 'block';
        
        // Trigger reflow to ensure animations work
        void modalElement.offsetWidth;
        
        // Add show class for animation
        setTimeout(() => {
          modalElement.classList.add('show');
        }, 10);
        
        this.orderModal.show();
      } else {
        // Fallback if bootstrap isn't loaded
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Attach close handler to the close button
        const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .modal-close-btn');
        closeButtons.forEach(button => {
          button.addEventListener('click', () => {
            modalElement.classList.remove('show');
            setTimeout(() => {
              modalElement.style.display = 'none';
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
            }, 300); // Match animation duration
          });
        });
      }
    } catch (error) {
      console.error('Error showing modal:', error);
      // Fallback display method
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  // Get status badge class
  getStatusClass(status: string): string {
    status = status || 'Processing';
    switch (status) {
      case 'Processing':
        return 'status-processing';
      case 'Shipped':
        return 'status-shipped';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-processing';
    }
  }

  // Render order tracking visualization
  renderOrderTracking(status: string): SafeHtml {
    status = status || 'Processing';
    
    const steps = [
      { id: 'processing', label: 'Order Placed', icon: 'bi-box' },
      { id: 'shipped', label: 'Shipped', icon: 'bi-truck' },
      { id: 'delivered', label: 'Delivered', icon: 'bi-house-check' }
    ];
    
    let currentStepIndex = 0;
    
    if (status === 'Shipped') {
      currentStepIndex = 1;
    } else if (status === 'Delivered') {
      currentStepIndex = 2;
    } else if (status === 'Cancelled') {
      return this.sanitizer.bypassSecurityTrustHtml(`
        <div class="order-tracking">
          <div class="tracking-step">
            <div class="tracking-circle" style="background-color: rgba(220, 53, 69, 0.12); border-color: #dc3545; color: #dc3545;">
              <i class="bi bi-x-lg"></i>
            </div>
            <div class="tracking-label">Cancelled</div>
          </div>
        </div>
      `);
    }
    
    let html = '<div class="order-tracking">';
    
    steps.forEach((step, index) => {
      let circleClass = 'tracking-circle';
      let stepClass = 'tracking-step';
      
      if (index < currentStepIndex) {
        circleClass += ' completed';
        stepClass += ' completed';
      } else if (index === currentStepIndex) {
        circleClass += ' active';
        stepClass += ' active';
      }
      
      html += `
        <div class="${stepClass}">
          <div class="${circleClass}">
            <i class="bi ${step.icon}"></i>
          </div>
          <div class="tracking-label">${step.label}</div>
        </div>
      `;
    });
    
    html += '</div>';
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Helper method to initialize the modal
  private initializeModal(): void {
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      try {
        // Only create modal if bootstrap is defined
        if (typeof bootstrap !== 'undefined') {
          // Override any existing modal
          this.orderModal = new bootstrap.Modal(modalElement, {
            backdrop: false, // We're handling the backdrop with CSS
            keyboard: true,
            focus: true
          });
        }
      } catch (error) {
        console.warn('Bootstrap not available for modal initialization:', error);
      }
      
      // Reset any lingering show class
      modalElement.classList.remove('show');
    }
  }
}
