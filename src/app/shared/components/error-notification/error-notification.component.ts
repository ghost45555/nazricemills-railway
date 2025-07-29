import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorState, ErrorHandlerService } from '../../../services/error-handler.service';
import { PremiumButtonComponent } from '../premium-button/premium-button.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-error-notification',
    standalone: true,
    imports: [CommonModule, PremiumButtonComponent],
    templateUrl: './error-notification.component.html',
    styleUrls: ['./error-notification.component.css']
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Input() maxNotifications = 5;
  @Input() stackGap = 10;
  @Input() animationDuration = 300;

  errors: ErrorState[] = [];
  private subscription?: Subscription;

  constructor(private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    this.subscription = this.errorHandler.getErrors().subscribe(errors => {
      this.errors = Array.from(errors.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxNotifications);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getNotificationClasses(error: ErrorState): string[] {
    return [
      'error-notification',
      `error-notification--${error.type}`,
      `error-notification--${this.position}`,
      'error-notification--animate'
    ];
  }

  getNotificationStyles(index: number): { [key: string]: string } {
    const position = this.position.split('-');
    const isTop = position[0] === 'top';
    const offset = `${index * (this.stackGap + 100)}px`;

    return {
      [position[0]]: offset,
      [position[1]]: '20px',
      'z-index': `${1000 - index}`,
      '--animation-duration': `${this.animationDuration}ms`
    };
  }

  dismiss(error: ErrorState): void {
    if (error.dismiss) {
      error.dismiss();
    }
  }

  retry(error: ErrorState): void {
    if (error.retry) {
      error.retry();
    }
  }

  getIcon(type: ErrorState['type']): string {
    switch (type) {
      case 'error':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        `;
      case 'warning':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        `;
      case 'info':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        `;
    }
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
