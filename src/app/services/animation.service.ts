import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { gsap } from 'gsap';

interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private observers: Map<Element, IntersectionObserver> = new Map();
  private animationSubjects: Map<Element, BehaviorSubject<boolean>> = new Map();

  constructor(private ngZone: NgZone) {}

  /**
   * Observe an element for visibility changes and trigger animations
   */
  observeElement(
    element: Element, 
    options: AnimationOptions = {
      threshold: 0.1,
      rootMargin: '0px',
      once: true
    }
  ): BehaviorSubject<boolean> {
    // Return existing subject if element is already being observed
    if (this.animationSubjects.has(element)) {
      return this.animationSubjects.get(element)!;
    }

    // Create new subject for this element
    const subject = new BehaviorSubject<boolean>(false);
    this.animationSubjects.set(element, subject);

    // Create and store new observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Run inside NgZone to ensure change detection
          this.ngZone.run(() => {
            const isVisible = entry.isIntersecting;
            subject.next(isVisible);
            
            // Unobserve if animation should only run once
            if (isVisible && options.once) {
              observer.unobserve(entry.target);
            }
          });
        });
      },
      {
        threshold: options.threshold,
        rootMargin: options.rootMargin
      }
    );

    // Start observing
    observer.observe(element);
    this.observers.set(element, observer);

    return subject;
  }

  /**
   * Stop observing an element
   */
  unobserveElement(element: Element): void {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
    }

    const subject = this.animationSubjects.get(element);
    if (subject) {
      subject.complete();
      this.animationSubjects.delete(element);
    }
  }

  /**
   * Add a stagger delay to child elements
   */
  addStaggerDelay(
    container: Element, 
    childSelector: string, 
    baseDelay: number = 0.1
  ): void {
    const children = container.querySelectorAll(childSelector);
    children.forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${baseDelay * index}s`;
    });
  }


    /**
   * Animate testimonial elements with coordinated timing
   */
    animateTestimonialElements(
      card: HTMLElement,
      options: {
        quoteDelay?: number;
        underlineDelay?: number;
        starDelay?: number;
        ratingDelay?: number;
      } = {}
    ): void {
      const {
        quoteDelay = 0.4,
        underlineDelay = 0.6,
        starDelay = 0.7,
        ratingDelay = 0.3
      } = options;
  
      // Enhanced quote animations with 3D effects
      const quotes = card.querySelectorAll('.quote-start, .quote-end');
      quotes.forEach((quote, i) => {
        const el = quote as HTMLElement;
        const isStart = el.classList.contains('quote-start');
        
        // Set initial state
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transitionDelay = `${quoteDelay + (i * 0.2)}s`;
        el.style.opacity = '0';
        el.style.transform = `
          translate3d(${isStart ? '-50px' : '50px'}, 30px, -100px) 
          rotate3d(1, 0.5, 0, ${isStart ? '-60deg' : '60deg'}) 
          scale(0.8)
        `;
        
        // Force reflow
        el.offsetHeight;
        
        // Animate to final state
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = `
            translate3d(0, 0, 0) 
            rotate3d(1, 0.5, 0, 0deg) 
            scale(1)
          `;
          
          // Add glow effect
          el.style.filter = 'drop-shadow(0 0 20px rgba(var(--color-gold-rgb), 0.4))';
          
          // Add floating animation after entrance
          setTimeout(() => {
            el.style.animation = `elegantFloat 4s ease-in-out infinite ${isStart ? '0s' : '0.5s'}`;
          }, 1200 + (quoteDelay + (i * 0.2)) * 1000);
        });
      });
  
      // Animate images with a scaling effect
      const imageContainer = card.querySelector('.image-container') as HTMLElement;
      if (imageContainer) {
        imageContainer.style.transition = 'transform 0.6s ease-in-out';
        imageContainer.style.transform = 'scale(1.1)';
        requestAnimationFrame(() => {
          imageContainer.style.transform = 'scale(1)';
        });
      }
  
      // Animate underline
      const underline = card.querySelector('.underline') as HTMLElement;
      if (underline) {
        underline.style.transitionDelay = `${underlineDelay}s`;
        underline.style.transform = 'scaleX(0)';
        requestAnimationFrame(() => {
          underline.style.transform = 'scaleX(1)';
        });
      }
  
      // Animate stars
      const stars = card.querySelectorAll('.star.filled');
      stars.forEach((star, i) => {
        const el = star as HTMLElement;
        el.style.transitionDelay = `${starDelay + (i * 0.12)}s`;
        el.style.opacity = '0';
        el.style.transform = 'scale(0) rotate(-180deg)';
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1) rotate(0)';
        });
      });
  
      // Animate rating circle
      const ratingImageContainer = card.querySelector('.image-container') as HTMLElement;
      if (ratingImageContainer) {
        ratingImageContainer.style.transitionDelay = `${ratingDelay}s`;
        const rating = Number(ratingImageContainer.getAttribute('data-rating') || 0);
        const ratingPercent = (rating / 5) * 360;
        
        // Initial state
        ratingImageContainer.style.setProperty('--rating-percent', '0deg');
        ratingImageContainer.style.opacity = '0.6';
        ratingImageContainer.style.transform = 'scale(0.95)';
        
        // Animate to final state
        requestAnimationFrame(() => {
          ratingImageContainer.style.setProperty('--rating-percent', `${ratingPercent}deg`);
          ratingImageContainer.style.opacity = '1';
          ratingImageContainer.style.transform = 'scale(1)';
        });
      }
    }

  /**
   * Clean up all observers
   */
  cleanUp(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.animationSubjects.forEach(subject => subject.complete());
    this.animationSubjects.clear();
  }

  /**
   * Create a parallax effect on scroll
   */
  createParallax(
    element: HTMLElement, 
    speed: number = 0.5, 
    reverse: boolean = false,
    options: {
      scale?: boolean;
      rotation?: boolean;
      blur?: boolean;
    } = {}
  ): void {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      
      // Only apply parallax if element is in viewport
      if (scrolled + window.innerHeight > elementTop && 
          scrolled < elementTop + rect.height) {
        const yPos = (scrolled - elementTop) * speed;
        const transform = reverse ? yPos : -yPos;
        
        let transformString = `translate3d(0, ${transform}px, 0)`;
        
        // Add scale effect if enabled
        if (options.scale) {
          const scale = 1 + Math.abs(transform) * 0.001;
          transformString += ` scale(${scale})`;
        }
        
        // Add rotation effect if enabled
        if (options.rotation) {
          const rotate = transform * 0.02;
          transformString += ` rotate(${rotate}deg)`;
        }
        
        element.style.transform = transformString;
        
        // Add blur effect if enabled
        if (options.blur) {
          const blur = Math.abs(transform) * 0.02;
          element.style.filter = `blur(${Math.min(blur, 5)}px)`;
        }
      }
    };

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Create a magnetic effect on an element
   */
  createMagneticEffect(
    element: HTMLElement,
    options: {
      strength?: number;
      radius?: number;
      scale?: boolean;
    } = {}
  ): void {
    const {
      strength = 0.3,
      radius = 100,
      scale = true
    } = options;

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      
      if (distance < radius) {
        const power = (radius - distance) / radius;
        const transformX = x * strength * power;
        const transformY = y * strength * power;
        
        let transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
        if (scale) {
          transform += ` scale(${1 + power * 0.1})`;
        }
        
        element.style.transition = 'transform 0.1s cubic-bezier(0.23, 1, 0.32, 1)';
        element.style.transform = transform;
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      element.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  }

  /**
   * Create a premium text reveal animation
   */
  createTextReveal(
    element: HTMLElement,
    options: {
      duration?: number;
      stagger?: number;
      direction?: 'up' | 'down' | 'left' | 'right';
      ease?: string;
    } = {}
  ): void {
    const {
      duration = 1,
      stagger = 0.1,
      direction = 'up',
      ease = 'cubic-bezier(0.23, 1, 0.32, 1)'
    } = options;

    // Split text into spans
    const text = element.textContent || '';
    element.textContent = '';
    const words = text.split(' ');
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = this.getInitialTransform(direction);
      span.style.transition = `all ${duration}s ${ease} ${i * stagger}s`;
      element.appendChild(span);
    });

    // Create observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const spans = element.querySelectorAll('span');
          spans.forEach(span => {
            span.style.opacity = '1';
            span.style.transform = 'translate3d(0, 0, 0)';
          });
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(element);
  }

  private getInitialTransform(direction: 'up' | 'down' | 'left' | 'right'): string {
    const distance = '30px';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}, 0)`;
      case 'down':
        return `translate3d(0, -${distance}, 0)`;
      case 'left':
        return `translate3d(${distance}, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}, 0, 0)`;
      default:
        return `translate3d(0, ${distance}, 0)`;
    }
  }

  /**
   * Create a premium 3D card effect
   */
  create3DCardEffect(
    element: HTMLElement,
    options: {
      perspective?: number;
      tiltAmount?: number;
      glareOpacity?: number;
    } = {}
  ): void {
    const {
      perspective = 1000,
      tiltAmount = 20,
      glareOpacity = 0.3
    } = options;

    // Add perspective to parent
    element.style.perspective = `${perspective}px`;
    
    // Create glare element
    const glareElement = document.createElement('div');
    glareElement.className = 'card-glare';
    glareElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, ${glareOpacity}) 0%,
        rgba(255, 255, 255, 0) 60%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    element.appendChild(glareElement);

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      const rotateX = (0.5 - (y / rect.height)) * tiltAmount;
      const rotateY = ((x / rect.width) - 0.5) * tiltAmount;

      element.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
      `;

      // Update glare position
      glareElement.style.opacity = '1';
      glareElement.style.transform = `
        translate(${xPercent}%, ${yPercent}%)
        translate(-50%, -50%)
        scale(2)
      `;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'none';
      glareElement.style.opacity = '0';
    });
  }

  /**
   * Create a premium scroll-triggered morph effect
   */
  createMorphEffect(
    element: HTMLElement,
    options: {
      paths: string[];
      duration?: number;
      easing?: string;
    }
  ): void {
    const {
      paths,
      duration = 1,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
    } = options;

    let currentPathIndex = 0;
    const svg = element.querySelector('svg');
    const path = svg?.querySelector('path');

    if (!svg || !path) return;

    const morphPath = () => {
      currentPathIndex = (currentPathIndex + 1) % paths.length;
      path.style.transition = `d ${duration}s ${easing}`;
      path.setAttribute('d', paths[currentPathIndex]);
    };

    this.observeElement(element, {
      threshold: 0.5,
      once: false
    }).subscribe(isVisible => {
      if (isVisible) {
        morphPath();
      }
    });
  }

  /**
   * Create a premium particle effect
   */
  createParticleEffect(
    container: HTMLElement,
    options: {
      particleCount?: number;
      colors?: string[];
      size?: number;
      speed?: number;
    } = {}
  ): void {
    const {
      particleCount = 50,
      colors = ['#FFD700', '#FFA500', '#FF8C00'],
      size = 5,
      speed = 1
    } = options;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'premium-particle';
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        transform: translate3d(0, 0, 0);
      `;

      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.5 + 0.5) * speed;
      const startX = Math.random() * container.offsetWidth;
      const startY = Math.random() * container.offsetHeight;

      gsap.set(particle, { x: startX, y: startY });
      gsap.to(particle, {
        duration: 'random(2, 4)',
        x: `+=${Math.cos(angle) * 100}`,
        y: `+=${Math.sin(angle) * 100}`,
        opacity: 'random(0.3, 0.7)',
        repeat: -1,
        ease: 'none',
        delay: i * 0.1
      });
    }
  }
}
