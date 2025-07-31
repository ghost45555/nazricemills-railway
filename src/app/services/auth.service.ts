import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orderId?: string; // For linking order during signup
  saveAddress?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://peaceful-unity-production.up.railway.app/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage();
  }

  // Load user data from localStorage on service initialization
  private loadUserFromStorage(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.logout();
      }
    }
  }

  // Get the current user
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Register a new user
  register(payload: RegisterPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/customer-signup`, payload)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Registration error:', error);
          throw error;
        })
      );
  }

  // Login a user
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/customer-login`, payload)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  // Handle the authentication response
  private handleAuthResponse(response: LoginResponse): void {
    if (response && response.token) {
      // Store token and user data in localStorage (only in browser)
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Update subjects
      this.currentUserSubject.next(response.user);
      this.isLoggedInSubject.next(true);
    }
  }

  // Logout the user
  logout(): void {
    // Clear localStorage (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Reset subjects
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    
    // Redirect to home page (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/']);
    }
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  // Get saved addresses for a user
  getSavedAddresses(): Observable<any[]> {
    if (!this.isAuthenticated()) {
      return of([]);
    }
    
    const userId = this.getCurrentUser()?.id;
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return this.http.get<any[]>(`${this.API_URL}/addresses/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      catchError(error => {
        console.error('Error getting addresses:', error);
        return of([]);
      })
    );
  }

  // Save a new address
  saveAddress(addressData: any): Observable<any> {
    if (!this.isAuthenticated()) {
      return of(null);
    }
    
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return this.http.post<any>(`${this.API_URL}/addresses`, addressData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(error => {
        console.error('Error saving address:', error);
        throw error;
      })
    );
  }

  // Update a user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    if (!this.isAuthenticated()) {
      return of(this.getCurrentUser() as User);
    }
    
    const userId = this.getCurrentUser()?.id;
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(updatedUser => {
        // Update the stored user data
        const currentUser = this.getCurrentUser();
        const mergedUser = { ...currentUser, ...updatedUser };
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
        this.currentUserSubject.next(mergedUser);
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        throw error;
      })
    );
  }
} 