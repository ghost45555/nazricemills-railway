import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../shared/components/premium-card/premium-card.component';
import { ScrollAnimationDirective } from '../shared/directives/scroll-animation.directive';
import { AnimatedIconComponent } from '../shared/components/animated-icon/animated-icon.component';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Stat {
  value: number;
  suffix: string;
  label: string;
  duration: number;
  startDelay: number;
  currentValue: number;  // Added this property
}

@Component({
    selector: 'app-why-choose-us',
    standalone: true,
    imports: [
        CommonModule,
        SectionHeaderComponent,
        PremiumCardComponent,
        ScrollAnimationDirective,
        AnimatedIconComponent
    ],
    template: `
    <div class="why-choose-us">
      <app-section-header
        title="Why Choose Us"
        subtitle="Excellence in Every Grain"
        [animateIn]="true">
      </app-section-header>

      <div class="features-grid">
        <app-premium-card
          *ngFor="let feature of features"
          variant="feature"
          [animateIn]="true"
          [borderAccent]="true">
          
          <div cardHeader>
            <div class="feature-icon">
              <app-animated-icon [iconName]="feature.icon"></app-animated-icon>
            </div>
            <h3 class="feature-title">{{feature.title}}</h3>
          </div>

          <div class="feature-content">
            <p class="feature-description">{{feature.description}}</p>
          </div>
        </app-premium-card>
      </div>

      <div class="stats-container" [appScrollAnimation]="true">
        <div class="stat-item" *ngFor="let stat of stats" #statItem>
          <div class="stat-value">
            <span class="number">{{stat.currentValue}}</span>{{stat.suffix}}
          </div>
          <div class="stat-label">{{stat.label}}</div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./why-choose-us.component.css']
})
export class WhyChooseUsComponent implements AfterViewInit {
  @ViewChildren('statItem') statItems!: QueryList<ElementRef>;

  features: Feature[] = [
    {
      title: 'Modern Processing',
      description: 'State-of-the-art milling technology for perfect grains.',
      icon: 'modern-processing'
    },
    {
      title: 'Quality Control',
      description: 'Rigorous quality checks at every stage of processing.',
      icon: 'quality-control'
    },
    {
      title: 'Global Standards',
      description: 'Certified processes meeting international quality standards.',
      icon: 'global-standards'
    }
  ];

  stats: Stat[] = [
    { value: 30, suffix: '+', label: 'Years of Excellence', duration: 2000, startDelay: 0, currentValue: 0 },
    { value: 50, suffix: '+', label: 'Countries Served', duration: 2500, startDelay: 200, currentValue: 0 },
    { value: 100, suffix: '%', label: 'Quality Assurance', duration: 3000, startDelay: 400, currentValue: 0 },
    { value: 1000, suffix: 'K+', label: 'Happy Customers', duration: 3500, startDelay: 600, currentValue: 0 }
  ];

  private observers: IntersectionObserver[] = [];

  ngAfterViewInit() {
    this.setupStatAnimations();
  }

  private setupStatAnimations() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this.statItems.forEach((item, index) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateNumber(index);
            observer.disconnect();
          }
        });
      }, options);

      observer.observe(item.nativeElement);
      this.observers.push(observer);
    });
  }

  private animateNumber(index: number) {
    const stat = this.stats[index];
    const steps = 60; // Frames per second * duration in seconds
    const increment = stat.value / steps;
    let current = 0;
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    setTimeout(() => {
      const interval = setInterval(() => {
        const progress = current / steps;
        const easedProgress = easeOutQuart(progress);
        stat.currentValue = Math.round(easedProgress * stat.value);
        
        if (current >= steps) {
          stat.currentValue = stat.value;
          clearInterval(interval);
        }
        current++;
      }, stat.duration / steps);
    }, stat.startDelay);
  }

  ngOnDestroy() {
  }
}
