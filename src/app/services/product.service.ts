import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, ProductFilter, ProductCategory } from '../shared/interfaces/product.interface';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';


interface BackendFeature {
  id: number;
  feature: string;
  product: any;
}

interface BackendCertification {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendSpecification {
  id: number;
  specName: string;
  specValue: string;
  product: any;
}

interface BackendWeightOption {
  id: number;
  weightValue?: number;
  value?: number;
  price: number;
  packagingPhoto: string;
  product: any;
}

interface BackendNutritionalInfo {
  productId: number;
  servingSize: string;
  servingsPerContainer: string;
  calories: string;
  totalFat: string;
  saturatedFat: string;
  transFat: string;
  cholesterol: string;
  sodium: string;
  totalCarbohydrates: string;
  dietaryFiber: string;
  sugars: string;
  protein: string;
  vitaminA: string;
  vitaminC: string;
  calcium: string;
  iron: string;
  product: any;
}

interface BackendProduct {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  category: { id: number; name: string } | string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  pricePerKg: number;
  hasDiscount: boolean;
  discountPercentage: number;
  inventory: number;
  features: (BackendFeature | string)[];
  certifications: (BackendCertification | string)[];
  specifications: (BackendSpecification | { key: string; value: string })[];
  weightOptions: BackendWeightOption[];
  nutritionalInfo: BackendNutritionalInfo | null;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // private products: Product[] = [
  //   {
  //     id: '1',
  //     name: 'Super Kernel Basmati Rice',
  //     description: 'Premium long-grain basmati rice known for its distinctive aroma and delicate flavor.',
  //     imageUrl: '/assets/img/products/basmati-rice.jpg',
  //     category: 'Basmati',
  //     certifications: ['ISO 22000', 'HACCP'],
  //     features: [
  //       'Extra-long grain',
  //       'Distinctive aroma',
  //       'Non-sticky texture',
  //       'Perfect for biryani'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Extra Long' },
  //       { key: 'Cooking Time', value: '20-25 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '2% max' },
  //       { key: 'Chalky Grains', value: '3% max' },
  //       { key: 'Foreign Matter', value: '0.1% max' },
  //       { key: 'Paddy Grain', value: '0.5% max' },
  //       { key: 'Undermilled Red Strips', value: '0.5% max' },
  //       { key: 'Color Sorter Purity', value: '99.9%' },
  //       { key: 'Shelf Life', value: '24 months' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '160',
  //       totalFat: '0g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '36g',
  //       dietaryFiber: '0g',
  //       sugars: '0g',
  //       protein: '3g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '0%',
  //       iron: '2%'
  //     },
  //     isNewArrival: true,
  //     isBestSeller: false,
  //     pricePerKg: 1200,
  //     hasDiscount: true,
  //     discountPercentage: 10,
  //     inventory: 500,
  //     weightOptions: [
  //       { value: 1, price: 1200, packagingPhoto: '/assets/img/products/basmati-rice-1kg-packaging.jpg' },
  //       { value: 5, price: 5800, packagingPhoto: '/assets/img/products/basmati-rice-5kg-packaging.jpg' },
  //       { value: 10, price: 11000, packagingPhoto: '/assets/img/products/basmati-rice-10kg-packaging.jpg' },
  //       { value: 20, price: 20000, packagingPhoto: '/assets/img/products/basmati-rice-20kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   },
  //   {
  //     id: '2',
  //     name: 'Jasmine Rice',
  //     description: 'Parboiled basmati rice that maintains its shape and texture even after cooking.',
  //     imageUrl: '/assets/img/products/jasmine-rice.jpg',
  //     category: 'Basmati',
  //     certifications: ['ISO 22000', 'HACCP', 'Organic'],
  //     features: [
  //       'Parboiled for extra nutrition',
  //       'Maintains shape after cooking',
  //       'Rich in minerals',
  //       'Perfect for pulao'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Long' },
  //       { key: 'Cooking Time', value: '25-30 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '2% max' },
  //       { key: 'Chalky Grains', value: '3% max' },
  //       { key: 'Foreign Matter', value: '0.1% max' },
  //       { key: 'Paddy Grain', value: '0.5% max' },
  //       { key: 'Undermilled Red Strips', value: '0.5% max' },
  //       { key: 'Color Sorter Purity', value: '99.9%' },
  //       { key: 'Shelf Life', value: '24 months' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '160',
  //       totalFat: '0g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '36g',
  //       dietaryFiber: '0g',
  //       sugars: '0g',
  //       protein: '3g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '0%',
  //       iron: '2%'
  //     },
  //     isNewArrival: false,
  //     isBestSeller: false,
  //     pricePerKg: 1100,
  //     hasDiscount: false,
  //     inventory: 0,
  //     weightOptions: [
  //       { value: 1, price: 1100, packagingPhoto: '/assets/img/products/jasmine-rice-1kg-packaging.jpg' },
  //       { value: 5, price: 5300, packagingPhoto: '/assets/img/products/jasmine-rice-5kg-packaging.jpg' },
  //       { value: 10, price: 10000, packagingPhoto: '/assets/img/products/jasmine-rice-10kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   },
  //   {
  //     id: '3',
  //     name: 'Organic Brown Rice',
  //     description: 'Nutritious whole grain brown rice rich in fiber and essential minerals.',
  //     imageUrl: '/assets/img/products/brown-basmati-rice.jpg',
  //     category: 'Brown Rice',
  //     certifications: ['ISO 22000', 'HACCP', 'Organic'],
  //     features: [
  //       'Rich in fiber',
  //       'High in minerals',
  //       'Natural nutty flavor',
  //       'Perfect for healthy meals'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Medium' },
  //       { key: 'Cooking Time', value: '35-40 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '2% max' },
  //       { key: 'Chalky Grains', value: '3% max' },
  //       { key: 'Foreign Matter', value: '0.1% max' },
  //       { key: 'Paddy Grain', value: '0.5% max' },
  //       { key: 'Undermilled Red Strips', value: '0.5% max' },
  //       { key: 'Color Sorter Purity', value: '99.9%' },
  //       { key: 'Shelf Life', value: '12 months' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '160',
  //       totalFat: '0g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '36g',
  //       dietaryFiber: '0g',
  //       sugars: '0g',
  //       protein: '3g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '0%',
  //       iron: '2%'
  //     },
  //     isNewArrival: false,
  //     isBestSeller: false,
  //     pricePerKg: 900,
  //     hasDiscount: true,
  //     discountPercentage: 5,
  //     inventory: 750,
  //     weightOptions: [
  //       { value: 1, price: 900, packagingPhoto: '/assets/img/products/brown-rice-1kg-packaging.jpg' },
  //       { value: 5, price: 4300, packagingPhoto: '/assets/img/products/brown-rice-5kg-packaging.jpg' },
  //       { value: 10, price: 8200, packagingPhoto: '/assets/img/products/brown-rice-10kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   },
  //   {
  //     id: '4',
  //     name: 'Golden Sella Basmati',
  //     description: 'Parboiled basmati rice with enhanced nutritional value and golden color.',
  //     imageUrl: '/assets/img/products/golden-sella-basmati.jpg',
  //     category: 'Basmati',
  //     features: [
  //       'Parboiled for nutrition',
  //       'Golden color',
  //       'Firmer texture',
  //       'Ideal for professional cooking'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Extra Long' },
  //       { key: 'Cooking Time', value: '25-30 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '2% max' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '170',
  //       totalFat: '0g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '38g',
  //       dietaryFiber: '1g',
  //       sugars: '0g',
  //       protein: '4g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '0%',
  //       iron: '4%'
  //     },
  //     certifications: ['ISO 22000', 'HACCP'],
  //     isBestSeller: true,
  //     isNewArrival: false,
  //     pricePerKg: 1300,
  //     hasDiscount: false,
  //     inventory: 300,
  //     weightOptions: [
  //       { value: 1, price: 1300, packagingPhoto: '/assets/img/products/golden-sella-1kg-packaging.jpg' },
  //       { value: 5, price: 6300, packagingPhoto: '/assets/img/products/golden-sella-5kg-packaging.jpg' },
  //       { value: 10, price: 12000, packagingPhoto: '/assets/img/products/golden-sella-10kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   },
  //   {
  //     id: '5',
  //     name: 'Wild Rice Blend',
  //     description: 'A perfect blend of premium rice varieties for versatile cooking.',
  //     imageUrl: '/assets/img/products/wild-rice.jpg',
  //     category: 'Blended',
  //     features: [
  //       'Perfect blend of varieties',
  //       'Versatile cooking options',
  //       'Balanced texture',
  //       'Rich in nutrients'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Mixed' },
  //       { key: 'Cooking Time', value: '20-25 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '3% max' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '165',
  //       totalFat: '0.5g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '37g',
  //       dietaryFiber: '2g',
  //       sugars: '0g',
  //       protein: '3.5g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '1%',
  //       iron: '3%'
  //     },
  //     certifications: ['Non-GMO'],
  //     isBestSeller: false,
  //     isNewArrival: false,
  //     pricePerKg: 950,
  //     hasDiscount: true,
  //     discountPercentage: 8,
  //     inventory: 200,
  //     weightOptions: [
  //       { value: 1, price: 950, packagingPhoto: '/assets/img/products/wild-rice-1kg-packaging.jpg' },
  //       { value: 5, price: 4600, packagingPhoto: '/assets/img/products/wild-rice-5kg-packaging.jpg' },
  //       { value: 10, price: 8800, packagingPhoto: '/assets/img/products/wild-rice-10kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   },
  //   {
  //     id: '6',
  //     name: 'Organic Red Rice',
  //     description: 'Nutrient-rich organic red rice with a distinctive color and nutty flavor.',
  //     imageUrl: '/assets/img/products/red-rice.jpg',
  //     category: 'Specialty',
  //     features: [
  //       'Rich in antioxidants',
  //       'Natural red color',
  //       'Nutty flavor',
  //       'Perfect for healthy meals'
  //     ],
  //     specifications: [
  //       { key: 'Grain Length', value: 'Extra Long' },
  //       { key: 'Cooking Time', value: '20-25 minutes' },
  //       { key: 'Moisture', value: '12% max' },
  //       { key: 'Broken Grains', value: '2% max' },
  //       { key: 'Chalky Grains', value: '3% max' },
  //       { key: 'Foreign Matter', value: '0.1% max' },
  //       { key: 'Paddy Grain', value: '0.5% max' },
  //       { key: 'Undermilled Red Strips', value: '0.5% max' },
  //       { key: 'Color Sorter Purity', value: '99.9%' },
  //       { key: 'Shelf Life', value: '24 months' }
  //     ],
  //     nutritionalInfo: {
  //       servingSize: '1/4 cup (45g)',
  //       servingsPerContainer: 'About 22',
  //       calories: '155',
  //       totalFat: '1g',
  //       saturatedFat: '0g',
  //       transFat: '0g',
  //       cholesterol: '0mg',
  //       sodium: '0mg',
  //       totalCarbohydrates: '34g',
  //       dietaryFiber: '3g',
  //       sugars: '0g',
  //       protein: '3.5g',
  //       vitaminA: '0%',
  //       vitaminC: '0%',
  //       calcium: '1%',
  //       iron: '5%'
  //     },
  //     certifications: ['Organic', 'Non-GMO'],
  //     isNewArrival: true,
  //     isBestSeller: false,
  //     pricePerKg: 1400,
  //     hasDiscount: false,
  //     inventory: 500,
  //     weightOptions: [
  //       { value: 1, price: 1400, packagingPhoto: '/assets/img/products/red-rice-1kg-packaging.jpg' },
  //       { value: 5, price: 6800, packagingPhoto: '/assets/img/products/red-rice-5kg-packaging.jpg' },
  //       { value: 10, price: 13000, packagingPhoto: '/assets/img/products/red-rice-10kg-packaging.jpg' }
  //     ],
  //     packagingType: 'PP Woven Bags'
  //   }
  // ];
  private API_URL = 'https://peaceful-unity-production.up.railway.app/api';
  private BACKEND_BASE_URL = 'https://peaceful-unity-production.up.railway.app/';
  private useStaticData = false; // Set to true to use static data without backend
  
  // Store the products array here
  private products: Product[] = [];

  constructor(
    private http: HttpClient
  ) {
    // Initialize products on service creation
    this.loadProducts();
  }

  // Get the products array that's stored in the service
  getProductsArray(): Product[] {
    return this.products;
  }

  // Load products from backend and store them in the service
  private loadProducts(): void {
    this.http.get<BackendProduct[]>(`${this.API_URL}/products`)
      .pipe(
        map(products => this.transformProductsData(products)),
        catchError((error: any) => {
          console.error('Error fetching products from API, using static data instead:', error);
          // return of(this.staticDataService.getStaticProducts());
          return of([] as Product[]);
        })
      )
      .subscribe(products => {
        this.products = products;
        this.productsSubject.next(products); // Update the subject
        console.log('Products loaded and stored in service:', this.products);
      });
  }

  // Observable method for components that need to subscribe
  getProducts(): Observable<Product[]> {
    // Use the BehaviorSubject if it has values
    if (this.productsSubject.getValue().length > 0) {
      return this.productsSubject.asObservable();
    }
    
    // If products already loaded, return them immediately
    if (this.products.length > 0) {
      // Update the subject and return it
      this.productsSubject.next(this.products);
      return this.productsSubject.asObservable();
    }

    // Otherwise fetch from backend
    if (this.useStaticData) {
      // const products = this.staticDataService.getStaticProducts();
      // this.productsArray = products;
      // return of(products);
      return of([] as Product[]);
    }

    return this.http.get<BackendProduct[]>(`${this.API_URL}/products`).pipe(
      map(products => this.transformProductsData(products)),
      tap(products => {
        this.products = products; // Store the products
        this.productsSubject.next(products); // Update the subject
      }),
      catchError((error: any) => {
        console.error('Error fetching products from API, using static data instead:', error);
        // const fallbackProducts = this.staticDataService.getStaticProducts();
        // this.productsArray = fallbackProducts;
        return of([] as Product[]);
      })
    );
  }

  // Force refresh the products from the backend
  refreshProducts(): Observable<Product[]> {
    return this.http.get<BackendProduct[]>(`${this.API_URL}/products`).pipe(
      map(products => this.transformProductsData(products)),
      tap(products => {
        this.products = products; // Update the stored products
        this.productsSubject.next(products); // Update the subject
      }),
      catchError((error: any) => {
        console.error('Error refreshing products from API:', error);
        return of(this.products); // Return the existing array on error
      })
    );
  }

  // Transform backend data to match our desired model
  private transformProductsData(backendProducts: BackendProduct[]): Product[] {
    return backendProducts.map(product => {
      // For debugging
      console.log('Raw product data:', product);
      console.log('Raw nutritionalInfo:', product.nutritionalInfo);
      
      // Extract features as simple strings
      const features = product.features.map(feat => 
        typeof feat === 'string' ? feat : feat.feature
      );

      // Extract certifications as simple strings
      const certifications = product.certifications.map(cert => 
        typeof cert === 'string' ? cert : cert.name
      );

      // Extract specifications
      const specifications = product.specifications ? 
        product.specifications.map(spec => ({
          key: typeof spec === 'object' && 'specName' in spec ? spec.specName : 
               typeof spec === 'object' && 'key' in spec ? spec.key : '',
          value: typeof spec === 'object' && 'specValue' in spec ? spec.specValue : 
                 typeof spec === 'object' && 'value' in spec ? spec.value : ''
        })) : [];

      // Extract weight options and construct proper image URLs
      const weightOptions = product.weightOptions.map(option => ({
        value: typeof option.weightValue !== 'undefined' ? option.weightValue : 
               typeof option.value !== 'undefined' ? option.value : 0,
        price: option.price,
        packagingPhoto: this.constructWeightOptionImageUrl(product.id, option.id)
      }));

      // Transform nutritional info - more robust handling
      let nutritionalInfo = null;
      
      if (product.nutritionalInfo) {
        console.log('Processing nutritional info for product:', product.id, product.name);
        
        nutritionalInfo = {
          servingSize: product.nutritionalInfo.servingSize ?? '1/4 cup (45g)',
          servingsPerContainer: product.nutritionalInfo.servingsPerContainer ?? 'About 22',
          calories: product.nutritionalInfo.calories ?? '160',
          totalFat: product.nutritionalInfo.totalFat ?? '0g',
          saturatedFat: product.nutritionalInfo.saturatedFat ?? '0g',
          transFat: product.nutritionalInfo.transFat ?? '0g',
          cholesterol: product.nutritionalInfo.cholesterol ?? '0mg',
          sodium: product.nutritionalInfo.sodium ?? '0mg',
          totalCarbohydrates: product.nutritionalInfo.totalCarbohydrates ?? '36g',
          dietaryFiber: product.nutritionalInfo.dietaryFiber ?? '0g',
          sugars: product.nutritionalInfo.sugars ?? '0g',
          protein: product.nutritionalInfo.protein ?? '3g',
          vitaminA: product.nutritionalInfo.vitaminA ?? '0%',
          vitaminC: product.nutritionalInfo.vitaminC ?? '0%',
          calcium: product.nutritionalInfo.calcium ?? '0%',
          iron: product.nutritionalInfo.iron ?? '0%'
        };
        
        console.log('Transformed nutritional info:', nutritionalInfo);
      } else {
        // Default nutritional info if not provided by backend
        console.log('No nutritional info found for product:', product.id, product.name, '- using defaults');
        
        nutritionalInfo = {
          servingSize: '1/4 cup (45g)',
          servingsPerContainer: 'About 22',
          calories: '160',
          totalFat: '0g',
          saturatedFat: '0g',
          transFat: '0g',
          cholesterol: '0mg',
          sodium: '0mg',
          totalCarbohydrates: '36g',
          dietaryFiber: '0g',
          sugars: '0g',
          protein: '3g',
          vitaminA: '0%',
          vitaminC: '0%',
          calcium: '0%',
          iron: '2%'
        };
      }

      // Return transformed product
      return {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        imageUrl: this.constructProductImageUrl(product.id),
        category: typeof product.category === 'object' ? product.category.name : product.category,
        certifications,
        features,
        specifications,
        nutritionalInfo,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        isFeatured: product.isFeatured || false,
        pricePerKg: product.pricePerKg,
        hasDiscount: product.hasDiscount,
        discountPercentage: product.discountPercentage || 0,
        inventory: product.inventory,
        weightOptions
      } as Product;
    });
  }

  // Helper to ensure image URLs have the backend base URL when needed
  private ensureFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If URL already starts with http:// or https://, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If URL starts with /api/, add the base URL
    if (imageUrl.startsWith('/api/')) {
      return `${this.BACKEND_BASE_URL.replace(/\/$/, '')}${imageUrl}`;
    }
    
    // Otherwise, assume it's a relative path to the API
    return `${this.BACKEND_BASE_URL.replace(/\/$/, '')}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  // Helper to construct product image URL
  private constructProductImageUrl(productId: number): string {
    const url = `${this.BACKEND_BASE_URL.replace(/\/$/, '')}/api/products/${productId}/image`;
    console.log(`Constructed product image URL for product ${productId}:`, url);
    return url;
  }

  // Helper to construct weight option image URL
  private constructWeightOptionImageUrl(productId: number, weightOptionId: number): string {
    const url = `${this.BACKEND_BASE_URL.replace(/\/$/, '')}/api/products/${productId}/weight-options/${weightOptionId}/image`;
    console.log(`Constructed weight option image URL for product ${productId}, option ${weightOptionId}:`, url);
    return url;
  }

  // Helper method to format product specifications
  formatProductSpecifications(specs: Record<string, string>): { key: string, value: string }[] {
    return Object.entries(specs).map(([key, value]) => ({
      key: this.formatSpecKey(key),
      value
    }));
  }

  private formatSpecKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }








  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  private filterSubject = new BehaviorSubject<ProductFilter>({});











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
    return ['Basmati', 'Brown Rice', 'Blended', 'Specialty'];
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

  getFeaturedProducts(): Observable<Product[]> {
    return this.productsSubject.pipe(
      map(products => products.filter(product => product.isFeatured))
    );
  }

  calculateTotalPrice(product: Product, weight: number): number {
    const weightOption = product.weightOptions.find(w => w.value === weight);
    
    if (!weightOption) return 0;

    let total = weightOption.price;
    
    if (product.hasDiscount && product.discountPercentage) {
      total = total * (1 - product.discountPercentage / 100);
    }

    return Math.round(total);
  }
}
