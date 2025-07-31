import { Component, HostListener, ElementRef, Renderer2, OnInit, ViewChild, AfterViewInit, ContentChild, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, stagger, query, state, group } from '@angular/animations';
import { AnimationService } from '../services/animation.service';
import { CartService } from '../shared/services/cart.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface NavItem {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    animations: [
        trigger('buttonAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ]),
        trigger('mobileMenuAnimation', [
            transition(':enter', [
                style({
                    transform: 'translateX(100%)',
                    opacity: 0,
                    filter: 'blur(8px)'
                }),
                group([
                    animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({
                        transform: 'translateX(0)',
                        opacity: 1,
                        filter: 'blur(0)'
                    }))
                ])
            ]),
            transition(':leave', [
                group([
                    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
                        transform: 'translateX(100%)',
                        opacity: 0,
                        filter: 'blur(8px)'
                    }))
                ])
            ])
        ]),
        trigger('backdropAnimation', [
            transition(':enter', [
                style({ opacity: 0, backdropFilter: 'blur(0px) brightness(100%)', scale: 1.1 }),
                animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, backdropFilter: 'blur(20px) brightness(50%)', scale: 1 }))
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
                    opacity: 0,
                    backdropFilter: 'blur(0px) brightness(100%)',
                    scale: 1.05
                }))
            ])
        ]),
        trigger('menuItemsAnimation', [
            transition(':enter', [
                query('.nav-item', [
                    style({ opacity: 0, transform: 'translateY(30px)', filter: 'blur(4px)' }),
                    stagger(60, [
                        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }))
                    ])
                ], { optional: true })
            ]),
            transition(':leave', [
                query('.nav-item', [
                    stagger(-50, [
                        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' }))
                    ])
                ], { optional: true })
            ])
        ]),
        trigger('navbarScroll', [
            state('top', style({
                height: 'var(--nav-height-desktop)',
                backdropFilter: 'blur(0px)',
                backgroundColor: 'transparent',
                boxShadow: 'none'
            })),
            state('scrolled', style({
                height: 'var(--nav-height-scrolled)',
                backdropFilter: 'blur(20px)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-md)'
            })),
            transition('top <=> scrolled', [
                animate('0.3s ease-in-out')
            ])
        ]),
        trigger('backdropBlur', [
            state('top', style({
                backdropFilter: 'none',
                backgroundColor: 'transparent'
            })),
            state('scrolled', style({
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
            })),
            transition('top <=> scrolled', [
                animate('0.3s ease-in-out')
            ])
        ]),
        trigger('socialAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.9)' }))
            ])
        ]),
        trigger('menuAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('0.3s ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('0.3s ease-in', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nav') navElement!: ElementRef;
  
  isScrolled = false;
  isMobileMenuOpen = false;
  lastScrollTop = 0;
  isScrollingUp = true;
  scrollProgress = 0;
  isMobile = false;
  cartItemCount = 0;
  isLoggedIn = false;
  private cartSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;

  navItems: NavItem[] = [
    { path: '/', label: 'Home', exact: true },
    { path: '/about', label: 'About Us', exact: false },
    { path: '/products', label: 'Products', exact: false },
    { path: '/our-process', label: 'Our Process', exact: false },
    { path: '/contact', label: 'Contact', exact: false }
  ];

  socialLinks = [
    { icon: 'facebook', url: 'https://facebook.com' },
    { icon: 'instagram', url: 'https://instagram.com' },
    { icon: 'twitter', url: 'https://twitter.com' }
  ];

  constructor(
    private renderer: Renderer2, 
    private el: ElementRef,
    private animationService: AnimationService,
    private cartService: CartService,
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only check window width in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 900;
    }
  }

  ngOnInit() {
    // Only run browser-specific code in browser environment
    if (isPlatformBrowser(this.platformId)) {
      if (!this.isMobile) {
        this.initializeParallaxEffects();
      }
      
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 900;
        if (this.isMobile) {
          this.resetAllEffects();
        }
      });
    }

    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Subscribe to auth state changes
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngAfterViewInit() {
    this.checkScroll();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private resetAllEffects() {
    const nav = this.el.nativeElement.querySelector('nav');
    const logo = this.el.nativeElement.querySelector('.logo');
    
    // Reset all styles that could cause blinking
    this.renderer.setStyle(nav, 'transform', 'none');
    this.renderer.setStyle(nav, '--scroll-progress', '0%');
    this.renderer.setStyle(nav, 'animation', 'none');
    this.renderer.setStyle(nav, 'transition', 'none');
    
    this.renderer.setStyle(logo, 'transform', 'none');
    this.renderer.setStyle(logo, 'animation', 'none');
    this.renderer.setStyle(logo, 'transition', 'none');
    this.renderer.setStyle(logo, 'opacity', '1');
    this.renderer.setStyle(logo, 'visibility', 'visible');
  }

  private initializeParallaxEffects() {
    // Remove parallax initialization
    return;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Only handle scroll in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  private checkScroll() {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 50;
    this.isScrollingUp = scrollTop < this.lastScrollTop;
    this.lastScrollTop = scrollTop;

    // Calculate scroll progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = (scrollTop / docHeight) * 100;

    // Update scroll progress indicator only
    const nav = this.el.nativeElement.querySelector('nav');
    this.renderer.setStyle(nav, '--scroll-progress', `${this.scrollProgress}%`);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen) {
        this.renderer.addClass(document.body, 'menu-open');
      } else {
        this.renderer.removeClass(document.body, 'menu-open');
      }
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
}
