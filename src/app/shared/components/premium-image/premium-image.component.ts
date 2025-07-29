import { Component, Input, Output, EventEmitter, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';

@Component({
    selector: 'app-premium-image',
    standalone: true,
    imports: [CommonModule, ScrollAnimationDirective],
    templateUrl: './premium-image.component.html',
    styleUrls: ['./premium-image.component.css']
})
export class PremiumImageComponent implements OnInit, OnChanges {
  @Input() src!: string;
  @Input() alt = '';
  @Input() width?: string | number;
  @Input() height?: string | number;
  @Input() aspectRatio?: string;
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
  @Input() fallbackSrc = 'assets/img/placeholder.jpg';
  @Input() blurHash?: string;
  @Input() loading: 'eager' | 'lazy' = 'lazy';
  @Input() animateIn = true;
  @Input() rounded = false;
  @Input() overlay = false;
  @Input() overlayColor = 'rgba(0, 0, 0, 0.3)';
  @Input() hoverEffect = false;
  @Input() hoverZoom = false;
  @Input() clickable = false;

  @Output() loaded = new EventEmitter<void>();
  @Output() error = new EventEmitter<ErrorEvent>();
  @Output() click = new EventEmitter<MouseEvent>();

  isLoading = false; // Start as false, set to true only when needed
  hasError = false;
  isIntersecting = true;
  private loadingTimeout?: NodeJS.Timeout;
  private imageLoaded = false;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Always consider the image as intersecting
    this.isIntersecting = true;
    console.log('Premium image component initialized with src:', this.src, 'isLoading:', this.isLoading);
    
    // Only show loading state if we have a src and it's not a static asset
    if (this.src && !this.imageLoaded && !this.isStaticAsset(this.src)) {
      this.isLoading = true;
      
      // Failsafe: if image doesn't load within 10 seconds, stop loading state
      this.loadingTimeout = setTimeout(() => {
        if (this.isLoading) {
          console.warn('Image loading timeout for:', this.src);
          this.isLoading = false;
          this.hasError = true;
        }
      }, 10000);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset loading state when src changes
    if (changes['src'] && !changes['src'].firstChange) {
      console.log('Image src changed from', changes['src'].previousValue, 'to', changes['src'].currentValue);
      
      // Clear any existing timeout
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
      }
      
      // Reset image loaded state
      this.imageLoaded = false;
      this.hasError = false;
      
      // Only show loading for non-static assets
      if (!this.isStaticAsset(this.src)) {
        this.isLoading = true;
        
        // Set new timeout for the new image
        this.loadingTimeout = setTimeout(() => {
          if (this.isLoading) {
            console.warn('Image loading timeout for:', this.src);
            this.isLoading = false;
            this.hasError = true;
          }
        }, 10000);
      } else {
        this.isLoading = false;
      }
    }
  }

  get classes(): string[] {
    return [
      'premium-image',
      this.isLoading ? 'premium-image--loading' : '',
      this.hasError ? 'premium-image--error' : '',
      this.rounded ? 'premium-image--rounded' : '',
      this.overlay ? 'premium-image--overlay' : '',
      this.hoverEffect ? 'premium-image--hover' : '',
      this.hoverZoom ? 'premium-image--zoom' : '',
      this.clickable ? 'premium-image--clickable' : '',
      this.animateIn ? 'premium-image--animate' : ''
    ].filter(Boolean);
  }

  get styles(): { [key: string]: string } {
    return {
      width: this.width ? 
        (typeof this.width === 'number' ? `${this.width}px` : this.width) : '100%',
      height: this.height ? 
        (typeof this.height === 'number' ? `${this.height}px` : this.height) : 'auto',
      aspectRatio: this.aspectRatio || 'auto',
      '--overlay-color': this.overlayColor
    };
  }

  onImageLoad(): void {
    console.log('Image loaded successfully:', this.src);
    
    // Clear loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = undefined;
    }
    
    // Mark image as loaded
    this.imageLoaded = true;
    
    // Immediately update loading state - no delay
    this.isLoading = false;
    this.hasError = false;
    
    // Force change detection
    setTimeout(() => {
      this.loaded.emit();
      console.log('Loading state reset for:', this.src);
    }, 0);
  }

  onImageError(event: any): void {
    console.log('Image failed to load:', this.src, event);
    
    // Clear loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = undefined;
    }
    
    this.isLoading = false;
    this.hasError = true;
    this.error.emit(event);
  }

  onImageClick(event: MouseEvent): void {
    if (this.clickable) {
      this.click.emit(event);
    }
  }

  private setupLazyLoading(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isIntersecting = true;
            this.observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  private isStaticAsset(src: string): boolean {
    return src.startsWith('assets/') || src.startsWith('/assets/') || src.startsWith('./assets/');
  }
}
