import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';

type CardVariant = 'default' | 'product' | 'testimonial' | 'feature';
type CardElevation = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-premium-card',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './premium-card.component.html',
  styleUrls: ['./premium-card.component.css']
})
export class PremiumCardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() elevation: CardElevation = 'md';
  @Input() hoverEffect = true;
  @Input() animateIn = true;
  @Input() borderAccent = false;
  @Input() fullWidth = false;
  @Input() aspectRatio?: string;
  @Input() backgroundColor?: string;
  @Input() imageSrc?: string;
  @Input() imageAlt?: string;
  @Input() imagePosition: 'top' | 'left' | 'right' | 'bottom' = 'top';
  @Input() badge?: string;
  @Input() badgeVariant: 'primary' | 'secondary' | 'accent' | 'error' = 'primary';
  @Input() clickable = false;

  showSpecs = false;
  imageLoaded = false;
  imageError = false;

  @Output() click = new EventEmitter<void>();
  @Output() specsClick = new EventEmitter<void>();

  get classes(): string[] {
    return [
      'premium-card',
      `premium-card--${this.variant}`,
      `premium-card--elevation-${this.elevation}`,
      this.hoverEffect ? 'premium-card--hover' : '',
      this.borderAccent ? 'premium-card--border-accent' : '',
      this.fullWidth ? 'premium-card--full-width' : '',
      this.imageSrc ? `premium-card--image-${this.imagePosition}` : '',
      this.badge ? 'premium-card--has-badge' : '',
      this.clickable ? 'premium-card--clickable' : '',
      this.showSpecs ? 'premium-card--showing-specs' : ''
    ].filter(Boolean);
  }

  get imageStyles(): { [key: string]: string } {
    return {
      'aspect-ratio': this.aspectRatio || 'auto'
    };
  }

  get cardStyles(): { [key: string]: string } {
    return {
      'background-color': this.backgroundColor || ''
    };
  }

  onClick(): void {
    if (this.clickable) {
      this.click.emit();
    }
  }

  onSpecsClick(event: Event): void {
    event.stopPropagation();
    this.showSpecs = !this.showSpecs;
    
    if (this.showSpecs) {
      // Get the card element and scroll it into view
      const cardElement = (event.target as HTMLElement).closest('.premium-card');
      if (cardElement) {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    }
  }

  onImageLoad(): void {
    this.imageLoaded = true;
    this.imageError = false;
  }

  onImageError(): void {
    this.imageLoaded = false;
    this.imageError = true;
  }
}
