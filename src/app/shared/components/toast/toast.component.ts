import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="visible" class="toast" [class.success]="type === 'success'" [class.error]="type === 'error'">
      {{ message }}
    </div>
  `,
    styles: [`
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    .success {
      background-color: var(--color-success, #4caf50);
    }

    .error {
      background-color: var(--color-error, #f44336);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  private timeout: any;
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.show(toast.message, toast.type);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private show(message: string, type: 'success' | 'error') {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.message = message;
    this.type = type;
    this.visible = true;

    this.timeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
} 