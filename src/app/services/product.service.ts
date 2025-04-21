import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Product, ProductFilter, ProductCategory } from '../shared/interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Premium Basmati Rice',
      description: 'Extra-long grain basmati rice known for its exceptional aroma and taste.',
      imageUrl: 'assets/img/products/basmati-rice.jpg',
      category: 'Basmati',
      features: [
        'Extra-long grains',
        'Natural aroma',
        'Non-sticky texture',
        'Perfect for biryanis and pulao'
      ],
      specifications: {
        grainLength: 'Extra Long (>7.0mm)',
        color: 'Pearl White',
        texture: 'Fluffy and Separate',
        aroma: 'Strong Natural Fragrance',
        cookingTime: '15-20 minutes'
      },
      certifications: ['ISO 22000', 'HACCP', 'Organic'],
      isBestSeller: true
    },
    {
      id: '2',
      name: 'Brown Basmati Rice',
      description: 'Wholesome brown basmati rice rich in nutrients and natural goodness.',
      imageUrl: 'assets/img/products/brown-basmati-rice.jpg',
      category: 'Brown Rice',
      features: [
        'Nutrient-rich',
        'High fiber content',
        'Natural whole grain',
        'Heart-healthy choice'
      ],
      specifications: {
        grainLength: 'Long (6.5-7.0mm)',
        color: 'Light Brown',
        texture: 'Slightly Chewy',
        aroma: 'Nutty Fragrance',
        cookingTime: '20-25 minutes'
      },
      certifications: ['Organic', 'Non-GMO'],
      isNewArrival: true
    },
    {
      id: '3',
      name: 'Golden Sella Basmati',
      description: 'Parboiled basmati rice with enhanced nutritional value and golden color.',
      imageUrl: 'assets/img/products/golden-sella-basmati.jpg',
      category: 'Basmati',
      features: [
        'Parboiled for nutrition',
        'Golden color',
        'Firmer texture',
        'Ideal for professional cooking'
      ],
      specifications: {
        grainLength: 'Extra Long (>7.0mm)',
        color: 'Golden',
        texture: 'Firm and Separate',
        aroma: 'Mild Fragrance',
        cookingTime: '18-22 minutes'
      },
      certifications: ['ISO 22000', 'HACCP'],
      isBestSeller: true
    },
    {
      id: '4',
      name: 'Jasmine Rice',
      description: 'Fragrant jasmine rice with a soft, sticky texture and floral aroma.',
      imageUrl: 'assets/img/products/jasmine-rice.jpg',
      category: 'Specialty',
      features: [
        'Soft and sticky texture',
        'Floral aroma',
        'Ideal for Asian cuisine',
        'Naturally fragrant'
      ],
      specifications: {
        grainLength: 'Medium (5.5-6.5mm)',
        color: 'White',
        texture: 'Soft and Sticky',
        aroma: 'Floral Fragrance',
        cookingTime: '12-15 minutes'
      },
      certifications: ['Organic', 'Non-GMO'],
      isNewArrival: true
    },
    {
      id: '5',
      name: 'Wild Rice Blend',
      description: 'A unique blend of wild and whole-grain rice for added nutrition and texture.',
      imageUrl: 'assets/img/products/wild-rice.jpg',
      category: 'Blended',
      features: [
        'Rich in antioxidants',
        'Nutty flavor',
        'High fiber content',
        'Great for pilafs and salads'
      ],
      specifications: {
        grainLength: 'Varied',
        color: 'Mixed',
        texture: 'Chewy and Firm',
        aroma: 'Earthy Fragrance',
        cookingTime: '35-40 minutes'
      },
      certifications: ['Non-GMO'],
      isBestSeller: false
    },
    {
      id: '6',
      name: 'Organic Red Rice',
      description: 'Nutrient-dense organic red rice with a hearty texture and earthy flavor.',
      imageUrl: 'assets/img/products/red-rice.jpg',
      category: 'Specialty',
      features: [
        'High in antioxidants',
        'Earthy flavor',
        'Hearty texture',
        'Certified organic'
      ],
      specifications: {
        grainLength: 'Medium (5.5-6.5mm)',
        color: 'Reddish-Brown',
        texture: 'Firm and Chewy',
        aroma: 'Earthy Fragrance',
        cookingTime: '30-35 minutes'
      },
      certifications: ['Organic', 'Non-GMO'],
      isNewArrival: true
    }
  ];


  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  private filterSubject = new BehaviorSubject<ProductFilter>({});

  constructor() {}

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getFilteredProducts(): Observable<Product[]> {
    return combineLatest([
      this.productsSubject,
      this.filterSubject
    ]).pipe(
      map(([products, filter]) => this.filterProducts(products, filter))
    );
  }

  setFilter(filter: ProductFilter): void {
    console.log('Setting filter:', filter);
    this.filterSubject.next(filter);
  }

  getCategories(): ProductCategory[] {
    return ['Basmati', 'Long Grain', 'Medium Grain', 'Short Grain', 'Brown Rice', 'Specialty'];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  private filterProducts(products: Product[], filter: ProductFilter): Product[] {
    if (!filter || Object.keys(filter).length === 0) {
      return products;
    }

    return products.filter(product => {
      // Category filter
      if (filter.category && product.category !== filter.category) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm?.trim()) {
        const searchTerm = filter.searchTerm.toLowerCase().trim();
        const searchMatch = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm);
        if (!searchMatch) {
          return false;
        }
      }

      // Certifications filter
      if (filter.certifications?.length) {
        const productCerts = product.certifications || [];
        if (!filter.certifications.every(cert => productCerts.includes(cert))) {
          return false;
        }
      }

      // New arrival filter
      if (filter.isNewArrival && !product.isNewArrival) {
        return false;
      }

      // Best seller filter
      if (filter.isBestSeller && !product.isBestSeller) {
        return false;
      }

      return true;
    });
  }

  getAllCertifications(): string[] {
    const certificationsSet = new Set<string>();
    this.products.forEach(product => {
      product.certifications?.forEach(cert => certificationsSet.add(cert));
    });
    return Array.from(certificationsSet);
  }

  getNewArrivals(): Observable<Product[]> {
    return this.productsSubject.pipe(
      map(products => products.filter(product => product.isNewArrival))
    );
  }

  getBestSellers(): Observable<Product[]> {
    return this.productsSubject.pipe(
      map(products => products.filter(product => product.isBestSeller))
    );
  }
}
