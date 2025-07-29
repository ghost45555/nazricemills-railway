import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ExtraInfoService, ExtraInfoEntry } from './extra-info.service';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { BlogTileComponent } from './blog-tile.component';

@Component({
  selector: 'app-extra-info-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroComponent, BlogTileComponent],
  template: `
    <app-hero
      subtitle="BLOGS"
      mainTitle="{{ mainTitle + ' ' }}"
      highlightText="Read BLOGS"
      description=""
      [backgroundImage]="'/assets/img/products-hero.jpeg'"
    ></app-hero>
    <div class="container blog-list-container">
      <div class="blog-list-grid">
        <app-blog-tile
          *ngFor="let entry of entries"
          [title]="entry.title"
          [excerpt]="entry.content | slice:0:120"
          (tileClick)="goToBlog(entry.id)"
        ></app-blog-tile>
      </div>
    </div>
  `,
  styleUrls: ['./extra-info-list.component.css']
})
export class ExtraInfoListComponent implements OnInit {
  entries: ExtraInfoEntry[] = [];
  productId!: number;
  mainTitle = '';

  constructor(private extraInfoService: ExtraInfoService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = Number(params.get('productId'));
      this.extraInfoService.getAllExtraInfo(this.productId).subscribe(entries => {
        this.entries = entries;
        this.mainTitle = entries.length && entries[0].product && entries[0].product.name ? entries[0].product.name : 'Product';
      });
    });
  }

  goToBlog(id: number) {
    this.router.navigate(['/extra-info', this.productId, id]);
  }
} 