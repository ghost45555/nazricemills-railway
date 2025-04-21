import { Component, HostListener, ElementRef, Renderer2, OnInit, ViewChild, AfterViewInit, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, stagger, query, state, group } from '@angular/animations';
import { AnimationService } from '../services/animation.service';

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
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'scale(1)' })
        )
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
          animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', 
            style({ 
              transform: 'translateX(0)', 
              opacity: 1, 
              filter: 'blur(0)' 
            })
          )
        ])
      ]),
      transition(':leave', [
        group([
          animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
            style({ 
              transform: 'translateX(100%)', 
              opacity: 0, 
              filter: 'blur(8px)' 
            })
          )
        ])
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0, backdropFilter: 'blur(0px) brightness(100%)', scale: 1.1 }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, backdropFilter: 'blur(20px) brightness(50%)', scale: 1 })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0, 
            backdropFilter: 'blur(0px) brightness(100%)', 
            scale: 1.05 
          })
        )
      ])
    ]),
    trigger('menuItemsAnimation', [
      transition(':enter', [
        query('.nav-item', [
          style({ opacity: 0, transform: 'translateY(30px)', filter: 'blur(4px)' }),
          stagger(60, [
            animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
              style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' })
            )
          ])
        ], { optional: true })
      ]),
      transition(':leave', [
        query('.nav-item', [
          stagger(-50, [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
              style({ opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' })
            )
          ])
        ], { optional: true })
      ])
    ]),
    trigger('navbarScroll', [
      state('top', style({
        height: 'var(--nav-height-desktop)',
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(28, 35, 45, 0.92)'
      })),
      state('scrolled', style({
        height: 'var(--nav-height-scrolled)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(28, 35, 45, 0.96)'
      })),
      transition('top <=> scrolled', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('backdropBlur', [
      state('top', style({
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(18, 24, 32, 0.92)'
      })),
      state('scrolled', style({
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(18, 24, 32, 0.96)'
      })),
      transition('top <=> scrolled', [
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('socialAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'scale(0.9)' })
        )
      ])
    ]),
    trigger('menuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0, 
            transform: 'translateY(-10px)',
            filter: 'blur(4px)'
          })
        )
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  lastScrollTop = 0;
  isScrollingUp = true;
  scrollProgress = 0;
  isMobile = false;

  navItems: NavItem[] = [
    { path: '/', label: 'Home', exact: true },
    { path: '/about', label: 'About Us', exact: false },
    { path: '/products', label: 'Products', exact: false },
    { path: '/our-process', label: 'Our Process', exact: false },
    { path: '/contact', label: 'Contact', exact: false }
  ];

  socialLinks = [
    { icon: 'facebook', url: '#' },
    { icon: 'instagram', url: '#' },
    { icon: 'linkedin', url: '#' }
  ];

  constructor(
    private renderer: Renderer2, 
    private el: ElementRef,
    private animationService: AnimationService
  ) {
    this.isMobile = window.innerWidth <= 900;
  }

  ngOnInit() {
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

  private resetAllEffects() {
    const nav = this.el.nativeElement.querySelector('nav');
    const logo = this.el.nativeElement.querySelector('.logo');
    
    // Reset all styles that could cause blinking
    this.renderer.setStyle(nav, 'transform', 'none');
    this.renderer.setStyle(nav, '--scroll-shadow-intensity', '0');
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
    // Only initialize parallax on desktop
    if (window.innerWidth > 900) {
      const nav = this.el.nativeElement.querySelector('nav');
      this.animationService.createParallax(nav, 0.1, true);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isMobile) {
      return; // Skip all scroll effects on mobile
    }

    const st = window.scrollY;
    this.isScrollingUp = st < this.lastScrollTop;
    this.isScrolled = st > 50;
    this.lastScrollTop = st;

    // Calculate scroll progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = (st / docHeight) * 100;

    // Enhanced premium effects based on scroll
    const nav = this.el.nativeElement.querySelector('nav');
    const intensity = Math.min(st / 500, 0.15);
    const parallaxOffset = Math.min(st / 10, 20);
    const blurIntensity = Math.min(st / 100, 20);
    
    this.renderer.setStyle(nav, '--scroll-shadow-intensity', intensity.toString());
    this.renderer.setStyle(nav, '--scroll-progress', `${this.scrollProgress}%`);
    this.renderer.setStyle(nav, 'transform', `translateY(${-parallaxOffset}px)`);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.renderer.removeClass(document.body, 'menu-open');
  }
}
