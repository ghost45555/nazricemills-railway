import { Component, Input, Output, EventEmitter, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumButtonComponent } from '../premium-button/premium-button.component';
import { PremiumImageComponent } from '../premium-image/premium-image.component';
import { PremiumTagComponent } from '../premium-tag/premium-tag.component';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../../services/product.service';

interface WeightOption {
  value: number;
  price: number;
  packagingPhoto: string;
}

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    PremiumButtonComponent,
    PremiumImageComponent,
    PremiumTagComponent
  ],
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.css']
})
export class ProductDetailModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() product!: Product;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{product: Product, weight: number, price: number}>();
  @Output() buyNow = new EventEmitter<{product: Product, weight: number, price: number}>();

  selectedWeight: WeightOption | null = null;
  private scrollIndicatorDismissed = false;
  private bodyScrollLocked = false;
  private _isOpen = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Initialize with first weight option if available
    if (this.product.weightOptions && this.product.weightOptions.length > 0) {
      this.selectedWeight = this.product.weightOptions[0];
    }
  }

  ngOnDestroy() {
    this.unlockBodyScroll();
  }

  private lockBodyScroll(): void {
    if (!this.bodyScrollLocked) {
      document.body.style.overflow = 'hidden';
      this.bodyScrollLocked = true;
    }
  }

  private unlockBodyScroll(): void {
    if (this.bodyScrollLocked) {
      document.body.style.overflow = '';
      this.bodyScrollLocked = false;
    }
  }

  @Input() set isOpen(value: boolean) {
    if (value) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
    this._isOpen = value;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && !this.scrollIndicatorDismissed) {
      if (modalContent.scrollTop > 0) {
        this.scrollIndicatorDismissed = true;
        modalContent.classList.add('scrolled');
      }
    }
  }

  @HostListener('document:scroll', ['$event'])
  onModalScroll(event: Event) {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && !this.scrollIndicatorDismissed) {
      if (modalContent.scrollTop > 0) {
        this.scrollIndicatorDismissed = true;
        modalContent.classList.add('scrolled');
      }
    }
  }

  ngAfterViewInit() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('scroll', () => {
        if (!this.scrollIndicatorDismissed && modalContent.scrollTop > 0) {
          this.scrollIndicatorDismissed = true;
          modalContent.classList.add('scrolled');
        }
      });
    }
  }

  onClose() {
    this.unlockBodyScroll();
    this.close.emit();
  }

  selectWeight(weight: WeightOption): void {
    this.selectedWeight = weight;
  }

  get totalPrice(): number {
    if (!this.selectedWeight) return 0;
    return this.productService.calculateTotalPrice(this.product, this.selectedWeight.value);
  }

  get originalPrice(): number {
    if (!this.selectedWeight) return 0;
    return this.selectedWeight.price;
  }

  onAddToCart(): void {
    if (!this.selectedWeight) return;
    
    this.addToCart.emit({
      product: this.product,
      weight: this.selectedWeight.value,
      price: this.totalPrice
    });
    
    this.onClose();
  }

  onBuyNow(): void {
    if (!this.selectedWeight) return;
    
    this.buyNow.emit({
      product: this.product,
      weight: this.selectedWeight.value,
      price: this.totalPrice
    });
    
    this.onClose();
  }

  getSpecIcon(key: string): string {
    const iconMap: { [key: string]: string } = {
      'origin': 'fa-map-marker-alt',
      'type': 'fa-tag',
      'grade': 'fa-star',
      'moisture': 'fa-tint',
      'length': 'fa-ruler',
      'color': 'fa-palette',
      'aroma': 'fa-leaf',
      'cooking': 'fa-utensils',
      'storage': 'fa-box',
      'shelf': 'fa-clock',
      'certification': 'fa-certificate',
      'packaging': 'fa-box-open',
      'weight': 'fa-weight-hanging',
      'brand': 'fa-trademark',
      'country': 'fa-globe',
      'harvest': 'fa-calendar-alt'
    };

    return iconMap[key.toLowerCase()] || 'fa-info-circle';
  }
} 