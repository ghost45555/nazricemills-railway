import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../shared/interfaces/product.interface';
import { Observable, map } from 'rxjs';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../shared/components/premium-card/premium-card.component';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, PremiumCardComponent],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.css'
})
export class ProductsSectionComponent implements OnInit {
  products$: Observable<Product[]>;

  constructor(private productService: ProductService) {
    this.products$ = this.productService.getProducts().pipe(
      map(products => products.slice(0, 3))
    );
  }

  ngOnInit(): void {}
}
