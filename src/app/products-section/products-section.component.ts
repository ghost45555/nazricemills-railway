import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../shared/interfaces/product.interface';
import { Observable, map } from 'rxjs';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../shared/components/premium-card/premium-card.component';
import { ProductDetailModalComponent } from '../shared/components/product-detail-modal/product-detail-modal.component';
import { CartService } from '../shared/services/cart.service';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeaderComponent,
    PremiumCardComponent,
    ProductDetailModalComponent
  ],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.css'
})
export class ProductsSectionComponent implements OnInit {
  products$: Observable<Product[]>;
  selectedProduct: Product | null = null;
  isModalOpen = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {
    this.products$ = this.productService.getProducts().pipe(
      map(products => products.slice(0, 3))
    );
  }

  ngOnInit(): void {}

  onProductClick(product: Product): void {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  onAddToCart(event: { product: Product; weight: number }) {
    const weightOption = event.product.weightOptions.find(w => w.value === event.weight);
    if (!weightOption) return;

    const cartItem = {
      id: `${event.product.id}-${event.weight}`,
      name: `${event.product.name} (${event.weight}kg - ${event.product.packagingType})`,
      price: weightOption.price,
      quantity: 1,
      image: event.product.imageUrl,
      packagingPhoto: weightOption.packagingPhoto
    };
    
    this.cartService.addToCart(cartItem);
    this.onModalClose();
  }

  onBuyNow(event: { product: Product; weight: number }) {
    this.onAddToCart(event);
    this.router.navigate(['/cart']);
  }
}
