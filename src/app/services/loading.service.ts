import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface LoadingState {
  id: string;
  message?: string;
  type?: 'global' | 'section' | 'component';
  variant?: 'circle' | 'dots' | 'pulse' | 'wave' | 'grain';
  overlay?: boolean;
  blur?: boolean;
  fullscreen?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, LoadingState>();
  private loadingSubject = new BehaviorSubject<Map<string, LoadingState>>(this.loadingStates);

  constructor() {}

  /**
   * Start a loading state
   */
  start(state: LoadingState): void {
    this.loadingStates.set(state.id, {
      type: 'component',
      variant: 'circle',
      overlay: false,
      blur: false,
      fullscreen: false,
      ...state
    });
    this.emitChange();
  }

  /**
   * Stop a loading state
   */
  stop(id: string): void {
    this.loadingStates.delete(id);
    this.emitChange();
  }

  /**
   * Stop all loading states
   */
  stopAll(): void {
    this.loadingStates.clear();
    this.emitChange();
  }

  /**
   * Get a specific loading state
   */
  getState(id: string): Observable<LoadingState | undefined> {
    return this.loadingSubject.pipe(
      map(states => states.get(id))
    );
  }

  /**
   * Get all loading states
   */
  getAllStates(): Observable<LoadingState[]> {
    return this.loadingSubject.pipe(
      map(states => Array.from(states.values()))
    );
  }

  /**
   * Check if any loading state is active
   */
  isLoading(): Observable<boolean> {
    return this.loadingSubject.pipe(
      map(states => states.size > 0)
    );
  }

  /**
   * Check if a specific loading state is active
   */
  isLoadingById(id: string): Observable<boolean> {
    return this.loadingSubject.pipe(
      map(states => states.has(id))
    );
  }

  /**
   * Get all global loading states
   */
  getGlobalStates(): Observable<LoadingState[]> {
    return this.loadingSubject.pipe(
      map(states => 
        Array.from(states.values()).filter(state => 
          state.type === 'global'
        )
      )
    );
  }

  /**
   * Start a global loading state
   */
  startGlobal(message?: string, variant: 'circle' | 'dots' | 'pulse' | 'wave' | 'grain' = 'grain'): void {
    this.start({
      id: 'global',
      type: 'global',
      message,
      variant,
      overlay: true,
      blur: true,
      fullscreen: true
    });
  }

  /**
   * Stop the global loading state
   */
  stopGlobal(): void {
    this.stop('global');
  }

  /**
   * Helper method to wrap async operations with loading state
   */
  async withLoading<T>(
    id: string,
    operation: () => Promise<T>,
    options: Partial<LoadingState> = {}
  ): Promise<T> {
    try {
      this.start({ id, ...options });
      const result = await operation();
      return result;
    } finally {
      this.stop(id);
    }
  }

  private emitChange(): void {
    this.loadingSubject.next(new Map(this.loadingStates));
  }
}
