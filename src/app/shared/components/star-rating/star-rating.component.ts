import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './star-rating.component.html',
    styleUrls: ['./star-rating.component.css']
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() readonly = false;
  @Input() showNumber = false;
  @Input() animate = true;
  @Input() color = 'gold';
  @Input() activeColor = '#FFD700';
  @Input() inactiveColor = '#E0E0E0';
  @Input() precision = 0.5;

  @Output() ratingChange = new EventEmitter<number>();

  hoverRating = 0;

  get stars(): number[] {
    return Array(this.maxRating).fill(0).map((_, i) => i + 1);
  }

  getStarClass(star: number): string[] {
    const rating = this.hoverRating || this.rating;
    const classes = ['star'];
    
    if (this.size) {
      classes.push(`star--${this.size}`);
    }

    if (this.animate) {
      classes.push('star--animate');
    }

    if (rating >= star) {
      classes.push('star--filled');
    } else if (rating >= star - 0.5) {
      classes.push('star--half');
    }

    return classes;
  }

  onStarClick(rating: number, event: MouseEvent): void {
    if (this.readonly) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const starWidth = rect.width;
    const clickX = event.clientX - rect.left;
    
    // If clicked on left half of star, use half rating
    let finalRating = rating;
    if (this.precision === 0.5 && clickX < starWidth / 2) {
      finalRating -= 0.5;
    }

    this.rating = finalRating;
    this.ratingChange.emit(finalRating);
  }

  onStarHover(star: number, event: MouseEvent): void {
    if (this.readonly) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const starWidth = rect.width;
    const hoverX = event.clientX - rect.left;
    
    let hoverRating = star;
    if (this.precision === 0.5 && hoverX < starWidth / 2) {
      hoverRating -= 0.5;
    }

    this.hoverRating = hoverRating;
  }

  onMouseLeave(): void {
    this.hoverRating = 0;
  }

  getStarStyle(star: number): { [key: string]: string } {
    const rating = this.hoverRating || this.rating;
    const percentage = this.getStarFillPercentage(star, rating);

    return {
      '--star-fill': `${percentage}%`,
      '--star-active-color': this.activeColor,
      '--star-inactive-color': this.inactiveColor
    };
  }

  private getStarFillPercentage(star: number, rating: number): number {
    if (rating >= star) {
      return 100;
    } else if (rating > star - 1) {
      return (rating - (star - 1)) * 100;
    }
    return 0;
  }
}
