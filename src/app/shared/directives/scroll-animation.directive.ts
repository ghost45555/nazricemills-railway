import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { AnimationService } from '../../services/animation.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[scrollAnimation], [appScrollAnimation]',
  standalone: true
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
  @Input() scrollAnimation: string = '';
  @Input() appScrollAnimation: boolean | string = true;
  @Input() animationClass = 'fade-in';
  @Input() threshold = 0.3; // Increased threshold to trigger when more of the element is visible
  @Input() rootMargin = '0px';
  @Input() once = true;
  @Input() delay = 0;
  @Input() stagger = false;
  @Input() staggerDelay = 0.1;
  @Input() staggerSelector = '';
  @Input() parallax = false;
  @Input() parallaxSpeed = 0.5;
  @Input() parallaxReverse = false;
  @Input() scrollDelay: number = 0;

  private subscription?: Subscription;

  constructor(
    private el: ElementRef,
    private animationService: AnimationService
  ) {}

  ngOnInit(): void {
    if (!this.appScrollAnimation) {
      return;
    }

    // Add initial animation class if specified
    if (this.animationClass) {
      this.el.nativeElement.classList.add(this.animationClass);
    }

    // Add animation delay if specified
    if (this.delay > 0) {
      this.el.nativeElement.style.animationDelay = `${this.delay}s`;
    }

    // Setup stagger animation if enabled
    if (this.stagger && this.staggerSelector) {
      this.animationService.addStaggerDelay(
        this.el.nativeElement,
        this.staggerSelector,
        this.staggerDelay
      );
    }

    // Setup parallax effect if enabled
    if (this.parallax) {
      this.animationService.createParallax(
        this.el.nativeElement,
        this.parallaxSpeed,
        this.parallaxReverse
      );
    }

    // Observe element for visibility
    this.subscription = this.animationService
      .observeElement(this.el.nativeElement, {
        threshold: this.threshold,
        rootMargin: this.rootMargin,
        once: this.once
      })
      .subscribe(isVisible => {
        if (isVisible) {
          this.el.nativeElement.classList.add('visible');
          if (this.animationClass) {
            this.el.nativeElement.classList.add(`${this.animationClass}-active`);
          }
        } else if (!this.once) {
          this.el.nativeElement.classList.remove('visible');
          if (this.animationClass) {
            this.el.nativeElement.classList.remove(`${this.animationClass}-active`);
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.animationService.unobserveElement(this.el.nativeElement);
  }
}
