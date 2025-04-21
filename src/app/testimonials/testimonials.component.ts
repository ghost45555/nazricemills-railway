import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../services/testimonial.service';
import { AnimationService } from '../services/animation.service';
import { Testimonial } from '../shared/interfaces/testimonial.interface';
import { Observable, Subscription, interval, fromEvent } from 'rxjs';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { ScrollAnimationDirective } from '../shared/directives/scroll-animation.directive';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ScrollAnimationDirective],
  providers: [AnimationService],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials: Testimonial[] = [];
  currentIndex = 0;
  isTransitioning = false;
  private autoPlaySubscription?: Subscription;
  private testimonialSubscription?: Subscription;
  private readonly AUTO_PLAY_INTERVAL = 5000; // 5 seconds
  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50;

  constructor(
    private testimonialService: TestimonialService,
    private animationService: AnimationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize testimonials with a delay to ensure proper rendering
    setTimeout(() => {
      this.testimonialSubscription = this.testimonialService.getTestimonials()
        .subscribe(testimonials => {
          this.testimonials = testimonials;
          if (this.testimonials.length > 1) {
            this.startAutoPlay();
            // Set initial rating percentage
            this.setRatingPercentage(0);
          }
          this.cdr.detectChanges();
        });
    }, 100);

    // Add keyboard navigation
    this.addKeyboardNavigation();
  }

  private setRatingPercentage(index: number) {
    const rating = this.testimonials[index].rating || 0;
    const ratingPercent = (rating / 5) * 360; // Convert rating to degrees (0-360)
    const imageContainer = document.querySelector('.testimonial-card.active .image-container') as HTMLElement;
    if (imageContainer) {
      imageContainer.style.setProperty('--rating-percent', `${ratingPercent}deg`);
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    if (this.testimonialSubscription) {
      this.testimonialSubscription.unsubscribe();
    }
  }

  private addKeyboardNavigation() {
    fromEvent(document, 'keydown').subscribe((event: any) => {
      if (event.key === 'ArrowLeft') {
        this.prev();
      } else if (event.key === 'ArrowRight') {
        this.next();
      }
    });
  }

  // Touch Event Handlers
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.pauseAutoPlay();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isTransitioning) return;

    const touchEndX = event.touches[0].clientX;
    const deltaX = touchEndX - this.touchStartX;

    if (Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        this.prev();
      } else {
        this.next();
      }
      this.touchStartX = touchEndX;
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    this.resumeAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlaySubscription = interval(this.AUTO_PLAY_INTERVAL)
      .subscribe(() => {
        if (!this.isTransitioning) {
          this.next();
          this.cdr.detectChanges();
        }
      });
  }

  stopAutoPlay() {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
      this.autoPlaySubscription = undefined;
    }
  }

  next() {
    if (this.isTransitioning || this.testimonials.length <= 1) return;
    
    this.isTransitioning = true;
    const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.animateSlide(nextIndex, 'next');
  }

  prev() {
    if (this.isTransitioning || this.testimonials.length <= 1) return;
    
    this.isTransitioning = true;
    const prevIndex = this.currentIndex === 0 
      ? this.testimonials.length - 1 
      : this.currentIndex - 1;
    this.animateSlide(prevIndex, 'prev');
  }

  private animateSlide(newIndex: number, direction: 'next' | 'prev') {
    const currentCard = document.querySelector('.testimonial-card.active') as HTMLElement;
    const nextCard = document.querySelectorAll('.testimonial-card')[newIndex] as HTMLElement;

    if (currentCard && nextCard) {
      // Setup perspective for 3D animations
      const container = currentCard.parentElement;
      if (container) {
        container.style.perspective = '2000px';
        container.style.transformStyle = 'preserve-3d';
      }

      // Remove any existing transition classes
      currentCard.classList.remove('prev-exit', 'next-exit');
      nextCard.classList.remove('prev-exit', 'next-exit');

      // Add exit animation class to current card with 3D transform
      currentCard.style.transform = direction === 'next' 
        ? 'translate3d(-100px, 0, -200px) rotateY(20deg)' 
        : 'translate3d(100px, 0, -200px) rotateY(-20deg)';
      currentCard.style.opacity = '0';
      currentCard.classList.remove('active');
      
      // Set rating percentage for the next slide
      const rating = this.testimonials[newIndex].rating || 0;
      const ratingPercent = (rating / 5) * 360;
      const nextImageContainer = nextCard.querySelector('.image-container') as HTMLElement;
      if (nextImageContainer) {
        nextImageContainer.style.setProperty('--rating-percent', `${ratingPercent}deg`);
      }
      
      // Prepare next card initial state
      nextCard.style.transform = direction === 'next'
        ? 'translate3d(100px, 0, -200px) rotateY(-20deg)'
        : 'translate3d(-100px, 0, -200px) rotateY(20deg)';
      nextCard.style.opacity = '0';
      
      // Animate to final state with a slight delay
      requestAnimationFrame(() => {
        nextCard.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        nextCard.style.transform = 'translate3d(0, 0, 0) rotateY(0)';
        nextCard.style.opacity = '1';
        nextCard.classList.add('active');
        
        // Get animation delays based on index
        const delays = this.testimonialService.getAnimationDelays(newIndex);
        
        // Reset and add animations
        const imageContainer = nextCard.querySelector('.image-container') as HTMLElement;
        if (imageContainer) {
          imageContainer.classList.remove('animate-border');
          imageContainer.getBoundingClientRect(); // Force reflow
          imageContainer.classList.add('animate-border');
        }

        // Animate all testimonial elements with coordinated timing
        this.animationService.animateTestimonialElements(nextCard, {
          quoteDelay: parseFloat(delays.quoteDelay),
          underlineDelay: parseFloat(delays.underlineDelay),
          starDelay: parseFloat(delays.starDelay),
          ratingDelay: 0.3
        });
      });

      // Update state after all animations complete
      setTimeout(() => {
        this.currentIndex = newIndex;
        this.isTransitioning = false;
        // Clean up animation classes
        currentCard.classList.remove('prev-exit', 'next-exit');
        this.cdr.detectChanges();
      }, 1500); // Extended to ensure all animations complete smoothly
    } else {
      this.currentIndex = newIndex;
      this.isTransitioning = false;
      this.cdr.detectChanges();
    }
  }

  goToSlide(index: number) {
    if (this.isTransitioning || 
        index === this.currentIndex || 
        index < 0 || 
        index >= this.testimonials.length) return;
    
    this.isTransitioning = true;
    const direction = index > this.currentIndex ? 'next' : 'prev';
    this.animateSlide(index, direction);
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    if (this.testimonials.length > 1 && !this.isTransitioning) {
      this.startAutoPlay();
    }
  }

  trackByFn(index: number, item: Testimonial): string {
    return item.id;
  }
}
