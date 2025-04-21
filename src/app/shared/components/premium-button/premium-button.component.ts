import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-premium-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-button.component.html',
  styleUrls: ['./premium-button.component.css']
})
export class PremiumButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() animateOnHover = true;
  @Input() rippleEffect = true;
  @Input() href?: string;
  @Input() target?: string;
  @Input() ariaLabel?: string;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get classes(): string[] {
    return [
      'premium-button',
      `premium-button--${this.variant}`,
      `premium-button--${this.size}`,
      this.fullWidth ? 'premium-button--full-width' : '',
      this.loading ? 'premium-button--loading' : '',
      this.disabled ? 'premium-button--disabled' : '',
      this.animateOnHover ? 'premium-button--animate' : '',
      this.rippleEffect ? 'premium-button--ripple' : ''
    ].filter(Boolean);
  }

  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      return;
    }

    if (this.rippleEffect) {
      this.createRippleEffect(event);
    }

    this.buttonClick.emit(event);
  }

  private createRippleEffect(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}
