import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SocialPlatform = 'google' | 'facebook' | 'linkedin' | 'other';

interface SocialProof {
  platform: SocialPlatform;
  link?: string;
  verified?: boolean;
}

@Component({
    selector: 'app-social-proof',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './social-proof.component.html',
    styleUrls: ['./social-proof.component.css']
})
export class SocialProofComponent {
  @Input() platform!: SocialPlatform;
  @Input() link?: string;
  @Input() verified = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showLabel = true;
  @Input() theme: 'light' | 'dark' = 'light';

  get platformIcon(): string {
    switch (this.platform) {
      case 'google':
        return `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
          </svg>`;
      case 'facebook':
        return `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>`;
      case 'linkedin':
        return `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>`;
      default:
        return `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
          </svg>`;
    }
  }

  get platformLabel(): string {
    switch (this.platform) {
      case 'google':
        return 'Google Review';
      case 'facebook':
        return 'Facebook Review';
      case 'linkedin':
        return 'LinkedIn Review';
      default:
        return 'Verified Review';
    }
  }

  get platformColor(): string {
    switch (this.platform) {
      case 'google':
        return '#4285F4';
      case 'facebook':
        return '#1877F2';
      case 'linkedin':
        return '#0A66C2';
      default:
        return '#34A853';
    }
  }

  get classes(): string[] {
    return [
      'social-proof',
      `social-proof--${this.size}`,
      `social-proof--${this.theme}`,
      this.verified ? 'social-proof--verified' : '',
      this.link ? 'social-proof--linked' : ''
    ].filter(Boolean);
  }
}
