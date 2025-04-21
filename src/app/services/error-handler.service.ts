import { Injectable, ErrorHandler } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ErrorState {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  details?: string;
  code?: string;
  retry?: () => void;
  dismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private errors = new Map<string, ErrorState>();
  private errorsSubject = new BehaviorSubject<Map<string, ErrorState>>(this.errors);
  private errorAddedSubject = new Subject<ErrorState>();

  constructor() {}

  /**
   * Handle Angular errors
   */
  handleError(error: Error): void {
    console.error('An error occurred:', error);
    this.showError({
      id: Date.now().toString(),
      message: 'An unexpected error occurred',
      type: 'error',
      timestamp: new Date(),
      details: error.message,
      autoClose: false
    });
  }

  /**
   * Show an error notification
   */
  showError(error: Partial<ErrorState>): void {
    const errorState: ErrorState = {
      id: error.id || Date.now().toString(),
      message: error.message || 'An error occurred',
      type: error.type || 'error',
      timestamp: error.timestamp || new Date(),
      details: error.details,
      code: error.code,
      retry: error.retry,
      dismiss: () => this.dismissError(errorState.id),
      autoClose: error.autoClose ?? true,
      duration: error.duration || 5000
    };

    this.errors.set(errorState.id, errorState);
    this.emitChange();
    this.errorAddedSubject.next(errorState);

    if (errorState.autoClose) {
      setTimeout(() => {
        this.dismissError(errorState.id);
      }, errorState.duration);
    }
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, options: Partial<ErrorState> = {}): void {
    this.showError({
      ...options,
      message,
      type: 'warning',
      autoClose: options.autoClose ?? true,
      duration: options.duration || 4000
    });
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, options: Partial<ErrorState> = {}): void {
    this.showError({
      ...options,
      message,
      type: 'info',
      autoClose: options.autoClose ?? true,
      duration: options.duration || 3000
    });
  }

  /**
   * Dismiss a specific error
   */
  dismissError(id: string): void {
    if (this.errors.has(id)) {
      this.errors.delete(id);
      this.emitChange();
    }
  }

  /**
   * Dismiss all errors
   */
  dismissAll(): void {
    this.errors.clear();
    this.emitChange();
  }

  /**
   * Get all current errors
   */
  getErrors(): Observable<Map<string, ErrorState>> {
    return this.errorsSubject.asObservable();
  }

  /**
   * Get error added events
   */
  onErrorAdded(): Observable<ErrorState> {
    return this.errorAddedSubject.asObservable();
  }

  /**
   * Check if there are any active errors
   */
  hasErrors(): boolean {
    return this.errors.size > 0;
  }

  /**
   * Get a specific error by ID
   */
  getError(id: string): ErrorState | undefined {
    return this.errors.get(id);
  }

  /**
   * Helper method to handle async operation errors
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.showError({
        message: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        type: 'error'
      });
      throw error;
    }
  }

  private emitChange(): void {
    this.errorsSubject.next(new Map(this.errors));
  }
}
