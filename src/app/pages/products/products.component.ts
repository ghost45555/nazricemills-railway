import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../../shared/components/premium-card/premium-card.component';
import { PremiumImageComponent } from '../../shared/components/premium-image/premium-image.component';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { HeroComponent } from "../../shared/components/hero/hero.component";
import { Product, ProductFilter, ProductCategory } from '../../shared/interfaces/product.interface';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductDetailModalComponent } from '../../shared/components/product-detail-modal/product-detail-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SectionHeaderComponent,
    PremiumCardComponent,
    PremiumImageComponent,
    ScrollAnimationDirective,
    HeroComponent,
    ProductDetailModalComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('tickAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);
  
  products$ = this.productService.getFilteredProducts();
  categories = this.productService.getCategories();
  certifications = this.productService.getAllCertifications();
  
  searchTerm = '';
  selectedCategory: ProductCategory | '' = '';
  selectedCertifications: string[] = [];
  showNewArrivals = false;
  showBestSellers = false;
  isFilterOpen = false;
  searchExpanded = false;
  private filterState: ProductFilter = {
    searchTerm: '',
    category: undefined,
    certifications: undefined,
    isNewArrival: false,
    isBestSeller: false
  };

  searchSuggestions$: Observable<string[]> | null = null;
  showSuggestions = false;
  selectedProduct: Product | null = null;
  isModalOpen = false;
  showSuccessMessage = false;
  successMessage = '';

  constructor() {
    this.products$ = this.productService.getFilteredProducts();
  }

  ngOnInit(): void {}

  updateFilters(): void {
    this.filterState = {
      searchTerm: this.searchTerm,
      category: this.selectedCategory || undefined,
      certifications: this.selectedCertifications.length ? this.selectedCertifications : undefined,
      isNewArrival: this.showNewArrivals,
      isBestSeller: this.showBestSellers
    };
  }

  applyFilters(): void {
    if (this.searchTerm || this.selectedCategory || this.selectedCertifications.length || 
        this.showNewArrivals || this.showBestSellers) {
      this.productService.setFilter(this.filterState);
    } else {
      this.productService.setFilter({});
    }
    this.isFilterOpen = false;
  }

  toggleSearch(): void {
    this.searchExpanded = !this.searchExpanded;
    this.showSuggestions = this.searchExpanded;
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedCertifications = [];
    this.showNewArrivals = false;
    this.showBestSellers = false;
    this.updateFilters();
    this.productService.setFilter({});
  }

  toggleCertification(cert: string): void {
    const index = this.selectedCertifications.indexOf(cert);
    if (index === -1) {
      this.selectedCertifications.push(cert);
    } else {
      this.selectedCertifications.splice(index, 1);
    }
    this.updateFilters();
  }

  onSearchInput(event: any): void {
    const value = event.target.value.toLowerCase().trim();
    this.updateFilters();
    
    if (value) {
      this.searchSuggestions$ = this.products$.pipe(
        map(products => products
          .filter(product => 
            product.name.toLowerCase().includes(value) ||
            product.description.toLowerCase().includes(value) ||
            product.category.toLowerCase().includes(value)
          )
          .map(product => product.name)
          .slice(0, 5)
        )
      );
      this.showSuggestions = true;
    } else {
      this.searchSuggestions$ = null;
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.updateFilters();
  }

  onProductClick(product: Product): void {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  onSpecsClick(product: Product): void {
    // Show specifications in a tooltip or small modal
    const specs = product.specifications;
    if (specs && specs.length > 0) {
      // You can implement a tooltip or small modal here
      // For now, we'll just log it
      console.log('Product Specifications:', specs);
    }
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  onAddToCart(event: { product: Product; weight: number; price: number }) {
    const weightOption = event.product.weightOptions.find(w => w.value === event.weight);
    if (!weightOption) return;

    const cartItem = {
      id: `${event.product.id}-${event.weight}`,
      name: `${event.product.name} (${event.weight}kg)`,
      price: event.price,
      quantity: 1,
      image: event.product.imageUrl,
      packagingPhoto: weightOption.packagingPhoto
    };
    
    this.cartService.addToCart(cartItem);
    this.showSuccessMessage = true;
    this.successMessage = 'Product added to cart successfully!';
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  onBuyNow(event: { product: Product; weight: number; price: number }) {
    this.onAddToCart(event);
    this.router.navigate(['/cart']);
    this.onModalClose();
  }
}
