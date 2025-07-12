import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, Input, inject, PLATFORM_ID, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, Renderer2 } from '@angular/core';
import { map } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../../services/loading.service';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger, 
  animateChild, 
  group, 
  sequence,
  keyframes,
  state
} from '@angular/animations';

export interface HeroFeature {
  icon: string;
  text: string;
}

@Component({
    selector: 'app-hero',
    imports: [CommonModule, RouterLink],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
    animations: [
        // Animations that don't affect layout
        trigger('fadeInUp', [
            state('void', style({
                opacity: 0,
                transform: 'translateY(30px)'
            })),
            state('*', style({
                opacity: 1,
                transform: 'translateY(0)'
            })),
            transition('void => *', animate('600ms 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'))
        ]),
        trigger('fadeInLeft', [
            state('void', style({
                opacity: 0,
                transform: 'translateX(-30px)'
            })),
            state('*', style({
                opacity: 1,
                transform: 'translateX(0)'
            })),
            transition('void => *', animate('600ms 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'))
        ]),
        trigger('fadeInScale', [
            state('void', style({
                opacity: 0,
                transform: 'scale(0.9)'
            })),
            state('*', style({
                opacity: 1,
                transform: 'scale(1)'
            })),
            transition('void => *', animate('600ms 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'))
        ]),
        trigger('staggerFeatures', [
            transition('void => *', [
                query('.feature', [
                    style({ opacity: 0, transform: 'translateY(30px)' }),
                    stagger(100, [
                        animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ])
    ]
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() subtitle = '';
  @Input() mainTitle = '';
  @Input() highlightText = '';
  @Input() description = '';
  @Input() ctaText = '';
  @Input() ctaLink = '';
  @Input() features: HeroFeature[] = [];
  private _backgroundImage = '';

  @Input()
  set backgroundImage(value: string) {
    console.log('Background image path:', value);
    this._backgroundImage = value;
  }

  get backgroundImage(): string {
    return this._backgroundImage;
  }

  isLoaded = false;
  private themeService = inject(ThemeService);
  private loadingService = inject(LoadingService);
  private loadingSubscription: Subscription | null = null;
  private scrollListener: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private contentHeight = 0;
  private heroHeight = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  readonly currentTheme$ = this.themeService.theme$.pipe(
    map(theme => theme || 'light')
  );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Set a fixed initial height for the hero section
      this.setInitialHeroHeight();
      
      // Ensure isLoaded is false initially
      this.isLoaded = false;
      
      // Subscribe to global loading state
      this.loadingSubscription = this.loadingService.isLoadingById('global').subscribe(isLoading => {
        if (!isLoading) {
          console.log('Loading complete, setting isLoaded to true');
          // When loading is complete, wait before showing content
          setTimeout(() => {
            this.isLoaded = true;
            this.cdr.detectChanges();
            
            // After content is loaded, initialize parallax and adjust height
            setTimeout(() => {
              this.initParallaxEffect();
              this.adjustHeroHeight();
            }, 100);
          }, 600);
        } else {
          this.isLoaded = false;
          this.cdr.detectChanges();
        }
      });
      
      // Check if already loaded
      if (!document.body.classList.contains('page-loading') && 
          !document.body.classList.contains('page-transitioning')) {
        setTimeout(() => {
          this.isLoaded = true;
          this.cdr.detectChanges();
          
          // After content is loaded, initialize parallax and adjust height
          setTimeout(() => {
            this.initParallaxEffect();
            this.adjustHeroHeight();
          }, 100);
        }, 600);
      }
    }
  }
  
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Set initial position of background
      const heroBackground = this.elementRef.nativeElement.querySelector('.hero-background');
      if (heroBackground) {
        this.renderer.setStyle(heroBackground, 'transform', 'translate3d(0, 0, 0) scale(1.05)');
      }
      
      // Create placeholder with proper dimensions
      this.createContentPlaceholder();
      
      // Monitor content height changes
      this.monitorContentHeight();
    }
  }
  
  ngOnDestroy() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    
    // Remove scroll listener
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setInitialHeroHeight() {
    // Set a fixed initial height for the hero section
    const heroElement = this.elementRef.nativeElement.querySelector('.hero');
    if (heroElement) {
      this.heroHeight = window.innerHeight;
      this.renderer.setStyle(heroElement, 'height', `${this.heroHeight}px`);
    }
  }
  
  private adjustHeroHeight() {
    // Adjust hero height based on content
    const heroElement = this.elementRef.nativeElement.querySelector('.hero');
    const contentElement = this.elementRef.nativeElement.querySelector('.hero-content');
    const featuresElement = this.elementRef.nativeElement.querySelector('.hero-features');
    
    if (heroElement && contentElement) {
      let totalHeight = contentElement.offsetHeight;
      
      if (featuresElement) {
        totalHeight += featuresElement.offsetHeight;
      }
      
      // Add padding (conservative estimate based on CSS)
      totalHeight += 300; // Reduced from 200 to account for optimized padding
      
      // Use the larger of window height or content height, with a minimum comfortable height
      const minComfortableHeight = Math.max(window.innerHeight, 750); // Minimum 750px
      const newHeight = Math.max(minComfortableHeight, totalHeight);
      
      // Only update if significantly different
      if (Math.abs(newHeight - this.heroHeight) > 50) {
        this.heroHeight = newHeight;
        this.renderer.setStyle(heroElement, 'height', `${this.heroHeight}px`);
        this.renderer.setStyle(heroElement, 'min-height', `${this.heroHeight}px`);
      }
    }
  }
  
  private createContentPlaceholder() {
    const placeholder = this.elementRef.nativeElement.querySelector('.hero-content-placeholder');
    const content = this.elementRef.nativeElement.querySelector('.hero-content');
    
    if (placeholder && content) {
      // Set placeholder dimensions to match content
      setTimeout(() => {
        const height = content.offsetHeight;
        const width = content.offsetWidth;
        
        this.renderer.setStyle(placeholder, 'height', `${height}px`);
        this.renderer.setStyle(placeholder, 'width', `${width}px`);
      }, 100);
    }
  }

  private initParallaxEffect() {
    const heroBackground = this.elementRef.nativeElement.querySelector('.hero-background');
    if (!heroBackground) return;
    
    // Set initial position
    this.renderer.setStyle(heroBackground, 'transform', 'translate3d(0, 0, 0) scale(1.05)');
    
    // Create scroll listener
    this.scrollListener = () => {
      const scrolled = window.pageYOffset;
      const heroElement = this.elementRef.nativeElement.querySelector('.hero');
      
      if (heroElement) {
        const heroRect = heroElement.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        
        // Only apply parallax when hero is in view
        if (heroBottom > 0) {
          const rate = scrolled * 0.2; // Reduced parallax intensity
          this.renderer.setStyle(heroBackground, 'transform', `translate3d(0, ${rate}px, 0) scale(1.05)`);
        }
      }
    };
    
    // Add scroll listener
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }
  
  private monitorContentHeight() {
    const heroContent = this.elementRef.nativeElement.querySelector('.hero-content');
    if (!heroContent) return;
    
    // Store initial content height
    this.contentHeight = heroContent.offsetHeight;
    
    // Create resize observer to update content height
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height;
        
        // Only update if significantly different
        if (Math.abs(newHeight - this.contentHeight) > 20) {
          this.contentHeight = newHeight;
          this.adjustHeroHeight();
          this.createContentPlaceholder();
        }
      }
    });
    
    // Observe content element
    this.resizeObserver.observe(heroContent);
  }
}
