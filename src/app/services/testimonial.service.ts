import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Testimonial } from '../shared/interfaces/testimonial.interface';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'John Smith',
      position: 'Executive Chef',
      company: 'Grand Hotel Restaurant',
      content: 'The quality of Naz Rice Mills\' basmati rice is exceptional. The aroma, texture, and taste are consistently perfect, making it our top choice for all our signature dishes. Their commitment to excellence aligns perfectly with our culinary standards.',
      rating: 5,
      imageUrl: '/assets/img/testimonials/testimonial-1.jpg',
      location: 'Dubai, UAE'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Food & Beverage Director',
      company: 'Luxury Catering Services',
      content: 'We\'ve been using Naz Rice Mills products for our high-end catering events, and the feedback has been phenomenal. Their premium rice varieties elevate every dish we serve. The consistency in quality has made them our trusted partner.',
      rating: 5,
      imageUrl: '/assets/img/testimonials/testimonial-2.jpg',
      location: 'London, UK'
    },
    {
      id: '3',
      name: 'Mohammed Al-Rashid',
      position: 'Restaurant Owner',
      company: 'Al-Rashid Fine Dining',
      content: 'The consistency and quality of Naz Rice Mills products have helped us maintain our high standards. Their customer service is equally impressive. We appreciate their attention to detail and prompt delivery, which are crucial for our operations.',
      rating: 5,
      imageUrl: '/assets/img/testimonials/testimonial-3.jpg',
      location: 'Riyadh, Saudi Arabia'
    }
  ];

  getAnimationDelays(index: number): {
    quoteDelay: string;
    underlineDelay: string;
    starDelay: string;
    ratingPercent: number;
  } {
    const baseDelay = 0.4;
    const increment = 0.05;
    return {
      quoteDelay: `${baseDelay + (index * increment)}s`,
      underlineDelay: `${baseDelay + 0.2 + (index * increment)}s`,
      starDelay: `${baseDelay + 0.3 + (index * increment)}s`,
      ratingPercent: 100
    };
  }

  private testimonialSubject = new BehaviorSubject<Testimonial[]>(this.testimonials);

  constructor() {}

  getTestimonials(): Observable<Testimonial[]> {
    return this.testimonialSubject.asObservable();
  }

  getTestimonialById(id: string): Testimonial | undefined {
    return this.testimonials.find(t => t.id === id);
  }
}
