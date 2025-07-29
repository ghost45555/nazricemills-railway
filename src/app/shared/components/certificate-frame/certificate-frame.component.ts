import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate-frame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-frame.component.html',
  styleUrls: ['./certificate-frame.component.css']
})
export class CertificateFrameComponent {
  /**
   * Certificate image URL (required)
   */
  @Input() image!: string;
  /**
   * Alt text for the certificate image (required)
   */
  @Input() alt!: string;
  /**
   * Certificate name/title (optional, shown below image)
   */
  @Input() name?: string;
  /**
   * Short description or authority (optional, shown below name)
   */
  @Input() description?: string;
  /**
   * Show magnify icon (default: true)
   */
  @Input() showMagnify: boolean = true;
  /**
   * ARIA label for accessibility (optional)
   */
  @Input() ariaLabel?: string;
  /**
   * Emits when the card or magnify icon is clicked (for modal/lightbox)
   */
  @Output() magnify = new EventEmitter<void>();

  /**
   * Keyboard accessibility: focus ring
   */
  @HostBinding('class.focused') isFocused = false;

  onCardClick() {
    this.magnify.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.magnify.emit();
    }
  }

  onFocus() {
    this.isFocused = true;
  }
  onBlur() {
    this.isFocused = false;
  }
} 