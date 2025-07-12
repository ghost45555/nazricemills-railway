import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { PremiumImageComponent } from '../shared/components/premium-image/premium-image.component';
import { PremiumCardComponent } from '../shared/components/premium-card/premium-card.component';
import { ScrollAnimationDirective } from '../shared/directives/scroll-animation.directive';
import { AnimationService } from '../services/animation.service';
import { ThemeService } from '../services/theme.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-about-section',
    imports: [
        CommonModule,
        SectionHeaderComponent,
        PremiumImageComponent,
        PremiumCardComponent,
        ScrollAnimationDirective
    ],
    templateUrl: './about-section.component.html',
    styleUrls: ['./about-section.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutSectionComponent implements OnInit {
  private themeService = inject(ThemeService);
  private animationService = inject(AnimationService);
  
  readonly currentTheme$ = this.themeService.theme$.pipe(
    map(theme => theme || 'light')
  );

  milestones = [
    {
      year: '1990',
      title: 'Foundation',
      description: 'Established with a vision to revolutionize rice processing through innovation and quality.'
    },
    {
      year: '2000',
      title: 'Innovation',
      description: 'Integrated state-of-the-art milling technology for superior grain quality.'
    },
    {
      year: '2010',
      title: 'Global Expansion',
      description: 'Extended our reach to international markets, serving premium rice worldwide.'
    },
    {
      year: '2023',
      title: 'Sustainability',
      description: 'Leading the industry in sustainable practices and eco-friendly processing.'
    }
  ];

  ngOnInit() {
    // Add stagger animation to timeline items
    const timelineContainer = document.querySelector('.timeline');
    if (timelineContainer) {
      this.animationService.addStaggerDelay(
        timelineContainer,
        '.timeline-item',
        0.2
      );
    }

    // Add stagger animation to about cards
    const cardsContainer = document.querySelector('.about-cards');
    if (cardsContainer) {
      this.animationService.addStaggerDelay(
        cardsContainer,
        '.about-card',
        0.2
      );
    }

    // Observe the section header for visibility changes
    const headerElement = document.querySelector('.section-header');
    if (headerElement) {
      this.animationService.observeElement(headerElement, {
        threshold: 0.1,
        once: true
      }).subscribe(isVisible => {
        if (isVisible) {
          headerElement.classList.add('fade-in');
        }
      });
    }
  }
}
