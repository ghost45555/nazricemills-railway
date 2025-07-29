import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumCardComponent } from '../../shared/components/premium-card/premium-card.component';

@Component({
  selector: 'app-blog-tile',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <app-premium-card
      [elevation]="'md'"
      [hoverEffect]="true"
      [clickable]="true"
      [imageSrc]="imageSrc"
      [imageAlt]="title"
      [variant]="'feature'"
      [borderAccent]="true"
      (click)="onTileClick()"
      class="blog-tile fade-in"
    >
      <div cardHeader>
        <h3 class="blog-tile__title">{{ title }}</h3>
      </div>
      <div>
        <p class="blog-tile__excerpt" *ngIf="excerpt">{{ excerpt }}</p>
      </div>
    </app-premium-card>
  `,
  styleUrls: ['./blog-tile.component.css']
})
export class BlogTileComponent {
  @Input() title!: string;
  @Input() excerpt?: string;
  @Input() imageSrc?: string;
  @Output() tileClick = new EventEmitter<void>();

  onTileClick() {
    this.tileClick.emit();
  }
} 