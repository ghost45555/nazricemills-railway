import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../../shared/components/premium-card/premium-card.component';
import { PremiumImageComponent } from '../../shared/components/premium-image/premium-image.component';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { HeroComponent } from "../../shared/components/hero/hero.component";
import { Product, ProductFilter, ProductCategory } from '../../shared/interfaces/product.interface';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    HeroComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  private productService = inject(ProductService);
  
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
    if (!this.searchExpanded) {
      this.showSuggestions = false;
    }
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
}
