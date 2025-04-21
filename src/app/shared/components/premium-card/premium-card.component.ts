import { Component, Input } from '@angular/core';
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
  @Input() badgeVariant: 'primary' | 'secondary' | 'accent' = 'primary';

  get classes(): string[] {
    return [
      'premium-card',
      `premium-card--${this.variant}`,
      `premium-card--elevation-${this.elevation}`,
      this.hoverEffect ? 'premium-card--hover' : '',
      this.borderAccent ? 'premium-card--border-accent' : '',
      this.fullWidth ? 'premium-card--full-width' : '',
      this.imageSrc ? `premium-card--image-${this.imagePosition}` : '',
      this.badge ? 'premium-card--has-badge' : ''
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
}
