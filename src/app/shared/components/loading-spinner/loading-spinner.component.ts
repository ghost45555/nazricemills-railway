import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SpinnerVariant = 'circle' | 'dots' | 'pulse' | 'wave' | 'grain';
type SpinnerSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  @Input() variant: SpinnerVariant = 'circle';
  @Input() size: SpinnerSize = 'medium';
  @Input() color?: string;
  @Input() overlay = false;
  @Input() text?: string;
  @Input() textPosition: 'top' | 'bottom' | 'none' = 'bottom';
  @Input() blur = false;
  @Input() fullscreen = false;
  @Input() backgroundColor?: string;

  get classes(): string[] {
    return [
      'loading-spinner',
      `loading-spinner--${this.variant}`,
      `loading-spinner--${this.size}`,
      this.overlay ? 'loading-spinner--overlay' : '',
      this.blur ? 'loading-spinner--blur' : '',
      this.fullscreen ? 'loading-spinner--fullscreen' : '',
      this.text ? 'loading-spinner--with-text' : '',
      `loading-spinner--text-${this.textPosition}`
    ].filter(Boolean);
  }

  get styles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.color) {
      styles['--spinner-color'] = this.color;
    }
    
    if (this.backgroundColor && (this.overlay || this.fullscreen)) {
      styles['--spinner-background'] = this.backgroundColor;
    }

    return styles;
  }

  get dots(): number[] {
    return Array(3).fill(0);
  }

  get waves(): number[] {
    return Array(5).fill(0);
  }
}
