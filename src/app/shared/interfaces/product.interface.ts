export type ProductCategory = 'Basmati' | 'Brown Rice' | 'Blended' | 'Specialty';

export interface NutritionalInfo {
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
}

export interface SpecificationItem {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  certifications: string[];
  features: string[];
  specifications: SpecificationItem[];
  nutritionalInfo: NutritionalInfo;
  isNewArrival: boolean;
  isBestSeller: boolean;
  pricePerKg: number;
  hasDiscount: boolean;
  discountPercentage?: number;
  inventory: number; // Inventory in kilograms
  weightOptions: {
    value: number;
    price: number;
    packagingPhoto: string;
  }[];
  packagingType: string; // Single packaging type for the product
}

export interface ProductFilter {
  searchTerm?: string;
  category?: ProductCategory;
  certifications?: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}
