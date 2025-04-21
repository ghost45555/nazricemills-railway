import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type TagVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
type TagSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-premium-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-tag.component.html',
  styleUrls: ['./premium-tag.component.css']
})
export class PremiumTagComponent {
  @Input() variant: TagVariant = 'default';
  @Input() size: TagSize = 'medium';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() removable = false;
  @Input() clickable = false;
  @Input() selected = false;
  @Input() disabled = false;
  @Input() outline = false;
  @Input() rounded = true;
  @Input() animate = true;
  @Input() tooltip?: string;
  @Input() backgroundColor?: string;
  @Input() textColor?: string;

  @Output() remove = new EventEmitter<void>();
  @Output() click = new EventEmitter<MouseEvent>();
  @Output() selectedChange = new EventEmitter<boolean>();

  get classes(): string[] {
    return [
      'premium-tag',
      `premium-tag--${this.variant}`,
      `premium-tag--${this.size}`,
      this.outline ? 'premium-tag--outline' : '',
      this.rounded ? 'premium-tag--rounded' : '',
      this.clickable ? 'premium-tag--clickable' : '',
      this.selected ? 'premium-tag--selected' : '',
      this.disabled ? 'premium-tag--disabled' : '',
      this.animate ? 'premium-tag--animate' : '',
      this.removable ? 'premium-tag--removable' : ''
    ].filter(Boolean);
  }

  get styles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.backgroundColor) {
      styles['--tag-background'] = this.backgroundColor;
    }
    
    if (this.textColor) {
      styles['--tag-color'] = this.textColor;
    }

    return styles;
  }

  onTagClick(event: MouseEvent): void {
    if (this.disabled) return;

    if (this.clickable) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
      this.click.emit(event);
    }
  }

  onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.remove.emit();
    }
  }
}
