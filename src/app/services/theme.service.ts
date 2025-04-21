import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private readonly darkThemeClass = 'dark-theme';
  
  // Use signal for reactive theme state
  private themeSignal = signal<Theme>('dark');
  
  // Observable for components that need to react to theme changes
  private themeSubject = new BehaviorSubject<Theme>('dark');
  theme$ = this.themeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
      
      // If no saved theme, set dark theme as default
      if (!savedTheme) {
        this.setTheme('dark');
        return;
      }

      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: Theme): void {
    // Update signal and subject
    this.themeSignal.set(theme);
    this.themeSubject.next(theme);

    if (isPlatformBrowser(this.platformId)) {
      // Update DOM
      if (theme === 'dark') {
        document.documentElement.classList.add(this.darkThemeClass);
      } else {
        document.documentElement.classList.remove(this.darkThemeClass);
      }

      // Save preference
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): Theme {
    return this.themeSignal();
  }
}
