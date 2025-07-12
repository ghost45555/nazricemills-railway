import { Component, Input, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-animated-icon',
    imports: [CommonModule],
    template: `
    <div class="animated-icon" 
         [class.animate]="isInView"
         [class.icon-loaded]="isIconLoaded"
         [class.dark-theme]="isDarkTheme">
      <ng-container [ngSwitch]="iconName">
        <object *ngSwitchCase="'global-standards'"
                data="assets/img/icons/Globe-shield-01.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
        <object *ngSwitchCase="'modern-processing'"
                data="assets/img/icons/multiple-files-processing-icon.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
        <object *ngSwitchCase="'quality-control'"
                data="assets/img/icons/quality-control-icon.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
        <object *ngSwitchCase="'sustainability'"
                data="assets/icons/sustainability.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
        <object *ngSwitchCase="'innovation'"
                data="assets/icons/innovation.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
        <object *ngSwitchCase="'community'"
                data="assets/icons/community.svg"
                type="image/svg+xml"
                class="icon"
                (load)="onSvgLoad($event)">
        </object>
      </ng-container>
    </div>
  `,
    styleUrls: ['./animated-icon.component.css']
})
export class AnimatedIconComponent implements AfterViewInit, OnDestroy {
  @Input() iconName!: string;
  isInView = false;
  isDarkTheme = false;
  isIconLoaded = false;
  private observer: IntersectionObserver | null = null;
  private themeObserver: MutationObserver | null = null;

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.setupThemeObserver();
    this.checkInitialTheme();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  onSvgLoad(event: Event) {
    const obj = event.target as HTMLObjectElement;
    if (obj && obj.contentDocument) {
      const svg = obj.contentDocument.querySelector('svg');
      if (svg) {
        // Add classes to SVG element
        svg.classList.add('svg-icon');
        
        // Process all paths and adjust viewBox if needed
        const paths = svg.querySelectorAll('path');
        paths.forEach((path, index) => {
          path.classList.add('animated-path');
          
          // Calculate total length for precise animation
          const length = path.getTotalLength();
          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();
          
          // Add data attribute for staggered animations
          path.setAttribute('data-index', index.toString());
        });

        // Remove any fill colors from the original SVG
        const elements = svg.querySelectorAll('*');
        elements.forEach(el => {
          if (el.hasAttribute('fill')) {
            el.setAttribute('fill', 'currentColor');
          }
        });

        // Mark icon as loaded to start pulse animation
        setTimeout(() => {
          this.isIconLoaded = true;
          this.cdr.detectChanges();
        }, 3000); // Wait for initial animation to complete
      }
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isInView = true;
          this.cdr.detectChanges();
          // Keep observer active to handle potential theme changes
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private setupThemeObserver() {
    // Watch for theme changes on the document body
    this.themeObserver = new MutationObserver(() => {
      this.checkTheme();
    });

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private checkInitialTheme() {
    this.checkTheme();
  }

  private checkTheme() {
    const isDark = document.body.classList.contains('dark-theme') || 
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (this.isDarkTheme !== isDark) {
      this.isDarkTheme = isDark;
      this.cdr.detectChanges();
    }
  }
}
