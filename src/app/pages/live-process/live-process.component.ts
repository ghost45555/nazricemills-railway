import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../../shared/components/premium-card/premium-card.component';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { HeroComponent } from "../../shared/components/hero/hero.component";
import { AnimationService } from '../../services/animation.service';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  byproducts?: string[];
}

@Component({
    selector: 'app-live-process',
    imports: [
        CommonModule,
        SectionHeaderComponent,
        PremiumCardComponent,
        ScrollAnimationDirective,
        HeroComponent
    ],
    templateUrl: './live-process.component.html',
    styleUrls: ['./live-process.component.css']
})
export class LiveProcessComponent {


  processSteps: ProcessStep[] = [
    {
      id: 1,
      title: 'Premium Paddy Selection',
      description: 'Our journey begins in the lush paddy fields, where we carefully select the finest grains. Each batch undergoes thorough quality checks to ensure premium raw material.',
      imagePath: '/assets/img/process/paddy-selection.jpg'
    },
    {
      id: 2,
      title: 'Husk Separation',
      description: 'Using state-of-the-art de-husking technology, we gently remove the outer layer while preserving the grain\'s integrity. The separated husk is sustainably repurposed.',
      imagePath: '/assets/img/process/husk-separation.jpeg',
      byproducts: ['Husk - Used for biomass energy']
    },
    {
      id: 3,
      title: 'Brown Rice Stage',
      description: 'At this stage, we reveal the nutrient-rich brown rice, maintaining its natural goodness and health benefits before moving to the next phase.',
      imagePath: '/assets/img/process/brown-rice.jpg'
    },
    {
      id: 4,
      title: 'Precision Grading',
      description: 'Advanced optical sorting technology precisely separates full-sized grains from undersized ones, ensuring uniform quality in every batch.',
      imagePath: '/assets/img/process/grading.jpg'
    },
    {
      id: 5,
      title: 'Premium Polishing',
      description: 'Our sophisticated polishing process transforms brown rice into pristine white rice while carefully preserving its nutritional value.',
      imagePath: '/assets/img/process/polishing.jpg',
      byproducts: ['Rice Bran - Rich in nutrients and oils']
    },
    {
      id: 6,
      title: 'Quality Sorting',
      description: 'Final quality checks using computer vision technology ensure perfect color consistency and remove any imperfections.',
      imagePath: '/assets/img/process/sorting.jpeg'
    },
    {
      id: 7,
      title: 'Global Distribution',
      description: 'The finished premium rice is carefully packaged and prepared for worldwide distribution, maintaining its quality from our facility to your table.',
      imagePath: '/assets/img/process/packaging.jpeg'
    }
  ];


  constructor(public animationService: AnimationService) {}
  ngAfterViewInit(): void {
      
      requestAnimationFrame(() => {
        this.initializeTimeline();
      });
  }

  
  private initializeTimeline(): void {
    document.querySelectorAll('.timeline-item').forEach(item => {
      this.animationService.observeElement(item, {
        threshold: 0.2,
        once: true
      }).subscribe(isVisible => {
        if (isVisible) {
          item.classList.add('visible');
        }
      });
    });
  }
}
