import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Google Analytics global functions
declare const gtag: (command: string, ...args: any[]) => void;

interface GAConfig {
  trackingId: string;
  anonymizeIp?: boolean;
  cookieDomain?: string;
  customMap?: { [key: string]: string };
}

interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: { [key: string]: any };
}

interface GAEcommerceItem {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
  currency?: string;
  variant?: string;
  brand?: string;
}

interface GAEcommerceEvent {
  currency: string;
  value: number;
  items: GAEcommerceItem[];
  transaction_id?: string;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private config: GAConfig = {
    trackingId: 'G-XXXXXXXXXX', // Replace with your actual GA4 tracking ID
    anonymizeIp: true,
    cookieDomain: 'nazricemills.com'
  };
  
  private initialized = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
      this.trackPageViews();
    }
  }

  /**
   * Initialize Google Analytics
   */
  private init(): void {
    if (this.initialized) return;

    try {
      // Create gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function(...args: any[]) {
        (window as any).dataLayer.push(args);
      };

      // Configure GA4
      (window as any).gtag('js', new Date());
              (window as any).gtag('config', this.config.trackingId, {
          anonymize_ip: this.config.anonymizeIp,
          cookie_domain: this.config.cookieDomain,
          custom_map: this.config.customMap
        });

      this.initialized = true;
      console.log('Google Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Track page views automatically on route changes
   */
  private trackPageViews(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Track a page view
   */
  trackPageView(url: string, title?: string): void {
    if (!isPlatformBrowser(this.platformId) || !(window as any).gtag) return;

    try {
      (window as any).gtag('config', this.config.trackingId, {
        page_path: url,
        page_title: title || document.title
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom events
   */
  trackEvent(event: GAEvent): void {
    if (!isPlatformBrowser(this.platformId) || !(window as any).gtag) return;

    try {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(element: string, action: string, value?: number): void {
    this.trackEvent({
      action: action,
      category: 'User Interaction',
      label: element,
      value: value
    });
  }

  /**
   * Track form submissions
   */
  trackFormSubmission(formName: string, success: boolean = true): void {
    this.trackEvent({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'Form',
      label: formName
    });
  }

  /**
   * Track file downloads
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent({
      action: 'file_download',
      category: 'Download',
      label: fileName,
      custom_parameters: {
        file_type: fileType
      }
    });
  }

  /**
   * Track outbound links
   */
  trackOutboundLink(url: string, linkText?: string): void {
    this.trackEvent({
      action: 'click',
      category: 'Outbound Link',
      label: linkText || url,
      custom_parameters: {
        link_url: url
      }
    });
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, category?: string): void {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      custom_parameters: {
        search_term: query,
        search_category: category
      }
    });
  }

  /**
   * Track ecommerce events - Purchase
   */
  trackPurchase(data: GAEcommerceEvent): void {
    if (!isPlatformBrowser(this.platformId) || !(window as any).gtag) return;

    try {
      (window as any).gtag('event', 'purchase', {
        transaction_id: data.transaction_id,
        affiliation: data.affiliation,
        value: data.value,
        currency: data.currency,
        coupon: data.coupon,
        shipping: data.shipping,
        tax: data.tax,
        items: data.items
      });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }

  /**
   * Track ecommerce events - Add to Cart
   */
  trackAddToCart(data: Partial<GAEcommerceEvent>): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'add_to_cart', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  }

  /**
   * Track ecommerce events - Remove from Cart
   */
  trackRemoveFromCart(data: Partial<GAEcommerceEvent>): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'remove_from_cart', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    } catch (error) {
      console.error('Failed to track remove from cart:', error);
    }
  }

  /**
   * Track ecommerce events - View Item
   */
  trackViewItem(data: Partial<GAEcommerceEvent>): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'view_item', {
        currency: data.currency,
        value: data.value,
        items: data.items
      });
    } catch (error) {
      console.error('Failed to track view item:', error);
    }
  }

  /**
   * Track ecommerce events - Begin Checkout
   */
  trackBeginCheckout(data: Partial<GAEcommerceEvent>): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'begin_checkout', {
        currency: data.currency,
        value: data.value,
        items: data.items,
        coupon: data.coupon
      });
    } catch (error) {
      console.error('Failed to track begin checkout:', error);
    }
  }

  /**
   * Track exceptions
   */
  trackException(description: string, fatal: boolean = false): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'exception', {
        description: description,
        fatal: fatal
      });
    } catch (error) {
      console.error('Failed to track exception:', error);
    }
  }

  /**
   * Track timing events
   */
  trackTiming(category: string, variable: string, value: number, label?: string): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label
      });
    } catch (error) {
      console.error('Failed to track timing:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperty(name: string, value: string): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('config', this.config.trackingId, {
        user_properties: {
          [name]: value
        }
      });
    } catch (error) {
      console.error('Failed to set user property:', error);
    }
  }

  /**
   * Set user ID for cross-device tracking
   */
  setUserId(userId: string): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) return;

    try {
      window.gtag('config', this.config.trackingId, {
        user_id: userId
      });
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Update GA4 tracking ID
   */
  updateTrackingId(trackingId: string): void {
    this.config.trackingId = trackingId;
    if (this.initialized) {
      this.init();
    }
  }

  /**
   * Get the current tracking ID
   */
  getTrackingId(): string {
    return this.config.trackingId;
  }

  /**
   * Check if GA is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
} 