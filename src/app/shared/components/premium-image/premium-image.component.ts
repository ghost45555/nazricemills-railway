import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';

@Component({
  selector: 'app-premium-image',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './premium-image.component.html',
  styleUrls: ['./premium-image.component.css']
})
export class PremiumImageComponent implements OnInit {
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

  isLoading = false;
  hasError = false;
  isIntersecting = true;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Always consider the image as intersecting
    this.isIntersecting = true;
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
    setTimeout(() => {
      this.isLoading = false;
      this.hasError = false;
      this.loaded.emit();
    });
  }

  onImageError(event: ErrorEvent): void {
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
  }
}
