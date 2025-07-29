import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ExtraInfoService, ExtraInfoEntry } from './extra-info.service';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { BlogTileComponent } from './blog-tile.component';
import { DatePipe } from '@angular/common';
import { LinebreaksPipe } from './linebreaks.pipe';

@Component({
  selector: 'app-extra-info-content',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroComponent, BlogTileComponent, DatePipe, LinebreaksPipe],
  template: `
    <app-hero
      subtitle="BLOGS"
      mainTitle="{{ mainTitle + ' ' }}"
      [highlightText]="entry?.title || ''"
      description=""
      [backgroundImage]="'/assets/img/products-hero.jpeg'"
    ></app-hero>
    <div class="container blog-content-container">
      <div class="blog-content-header fade-in" *ngIf="entry">
        <h1 class="blog-content-title">{{ entry.title }}</h1>
        <div class="blog-content-meta">
          <span>{{ entry.createdAt | date:'longDate' }}</span>
        </div>
        <hr class="blog-content-divider" />
      </div>
      <div class="blog-content-body fade-in" *ngIf="entry">
        <div class="blog-content-text" [innerHTML]="entry.content | linebreaks"></div>
      </div>
      <div class="related-posts-section fade-in" *ngIf="otherEntries.length">
        <h2 class="related-posts-title">More Posts</h2>
        <div class="related-posts-grid">
          <app-blog-tile
            *ngFor="let e of otherEntries"
            [title]="e.title"
            [excerpt]="e.content | slice:0:80"
            (tileClick)="goToBlog(e.id)"
          ></app-blog-tile>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./extra-info-content.component.css']
})
export class ExtraInfoContentComponent implements OnInit {
  entry: ExtraInfoEntry | undefined;
  otherEntries: ExtraInfoEntry[] = [];
  productId!: number;
  mainTitle = '';

  constructor(
    private route: ActivatedRoute,
    private extraInfoService: ExtraInfoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = Number(params.get('productId'));
      const id = Number(params.get('id'));
      this.extraInfoService.getAllExtraInfo(this.productId).subscribe(entries => {
        this.entry = entries.find(e => e.id === id);
        this.otherEntries = entries.filter(e => e.id !== id);
        const productEntry = entries.find(e => e.product && typeof e.product === 'object' && 'name' in e.product);
        this.mainTitle = productEntry && productEntry.product && productEntry.product.name ? productEntry.product.name : 'Product';
      });
    });
  }

  goToBlog(id: number) {
    this.router.navigate(['/extra-info', this.productId, id]);
  }
} 