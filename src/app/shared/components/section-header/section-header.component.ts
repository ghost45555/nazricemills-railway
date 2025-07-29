import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { AnimationService } from '../../../services/animation.service';

@Component({
    selector: 'app-section-header',
    standalone: true,
    imports: [CommonModule, ScrollAnimationDirective],
    templateUrl: './section-header.component.html',
    styleUrls: ['./section-header.component.css']
})
export class SectionHeaderComponent implements OnInit {
  @Input() subtitle?: string;
  @Input() title!: string;
  @Input() description?: string;
  @Input() alignment: 'left' | 'center' | 'right' = 'center';
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() showDivider = true;
  @Input() animateIn = true;
  @Input() titleSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() subtitleStyle: 'default' | 'elegant' | 'modern' = 'default';
  @Input() maxWidth?: string;

  constructor(
    private el: ElementRef,
    private animationService: AnimationService
  ) {}

  ngOnInit() {
    if (this.animateIn) {
      this.animationService.observeElement(this.el.nativeElement, {
        threshold: 0.3,
        rootMargin: '0px',
        once: true
      }).subscribe(isVisible => {
        if (isVisible) {
          this.el.nativeElement.classList.add('visible');
        }
      });
    }
  }

  get classes(): string[] {
    return [
      'section-header',
      `section-header--align-${this.alignment}`,
      `section-header--theme-${this.theme}`,
      this.showDivider ? 'section-header--with-divider' : '',
      `section-header--title-${this.titleSize}`,
      `section-header--subtitle-${this.subtitleStyle}`,
      this.animateIn ? '' : 'visible'
    ].filter(Boolean);
  }

  get containerStyles(): { [key: string]: string } {
    return {
      'max-width': this.maxWidth || '',
      'margin-left': this.alignment === 'center' ? 'auto' : '',
      'margin-right': this.alignment === 'center' ? 'auto' : ''
    };
  }
}
