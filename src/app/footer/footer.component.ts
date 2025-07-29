import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemeService } from '../services/theme.service';
import { map } from 'rxjs';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('0.6s ease-out', style({ opacity: 1 }))
            ])
        ]),
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.8s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('fadeScale', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.9)' }),
                animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class FooterComponent implements OnInit {
  private themeService = inject(ThemeService);
  currentYear = new Date().getFullYear();
   readonly currentTheme$ = this.themeService.theme$.pipe(
      map(theme => theme || 'light')
    );
  
  siteInfo = {
    siteName: 'Naz Rice Mills',
    legal: {
      companyName: 'Naz Rice Mills Pvt Ltd',
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms'
    }
  };

  socialHandles = {
    linkedin: 'nazricemills',
    instagram: 'nazricemills',
    twitter: 'nazricemills'
  };

  constructor() {}

  ngOnInit(): void {
    this.initializeScrollAnimation();
  }

  private initializeScrollAnimation(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    document.querySelectorAll('.footer-main > *').forEach(element => {
      observer.observe(element);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Add scroll-based animations or effects here if needed
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
