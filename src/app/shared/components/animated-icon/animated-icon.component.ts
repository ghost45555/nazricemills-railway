import { Component, Input, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-animated-icon',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="animated-icon" 
         [class.animate]="isInView"
         [class.icon-loaded]="isIconLoaded"
         [class.dark-theme]="isDarkTheme">
      <ng-container [ngSwitch]="iconName">
        <img *ngSwitchCase="'global-standards'"
             src="assets/img/icons/Globe-shield-01.svg"
             alt="Global Standards"
             class="icon"
             (load)="onSvgLoad($event)"
             (error)="onSvgError($event)">
        <img *ngSwitchCase="'modern-processing'"
             src="assets/img/icons/multiple-files-processing-icon.svg"
             alt="Modern Processing"
             class="icon"
             (load)="onSvgLoad($event)"
             (error)="onSvgError($event)">
        <img *ngSwitchCase="'quality-control'"
             src="assets/img/icons/quality-control-icon.svg"
             alt="Quality Control"
             class="icon"
             (load)="onSvgLoad($event)"
             (error)="onSvgError($event)">
        <img *ngSwitchCase="'sustainability'"
             src="assets/icons/sustainability.svg"
             alt="Sustainability"
             class="icon"
             (load)="onSvgLoad($event)">
        <img *ngSwitchCase="'innovation'"
             src="assets/icons/innovation.svg"
             alt="Innovation"
             class="icon"
             (load)="onSvgLoad($event)">
        <img *ngSwitchCase="'community'"
             src="assets/icons/community.svg"
             alt="Community"
             class="icon"
             (load)="onSvgLoad($event)">
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
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      console.log('AnimatedIconComponent - iconName:', this.iconName);
      this.setupIntersectionObserver();
      this.setupThemeObserver();
      this.checkInitialTheme();
    }
  }

  ngOnDestroy() {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }
    }
  }

  onSvgLoad(event: Event) {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('SVG loaded for icon:', this.iconName);
    const img = event.target as HTMLImageElement;
    if (img) {
      console.log('Image loaded successfully');
      // Mark icon as loaded to start pulse animation
      setTimeout(() => {
        this.isIconLoaded = true;
        this.cdr.detectChanges();
      }, 1000); // Reduced delay since we're not processing SVG paths
    }
  }

  onSvgError(event: Event) {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.error('SVG failed to load for icon:', this.iconName, event);
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
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isDark = document.body.classList.contains('dark-theme') || 
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (this.isDarkTheme !== isDark) {
      this.isDarkTheme = isDark;
      this.cdr.detectChanges();
    }
  }
}
