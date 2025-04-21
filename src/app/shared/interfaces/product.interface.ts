export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  features: string[];
  specifications?: {
    grainLength?: string;
    color?: string;
    texture?: string;
    aroma?: string;
    cookingTime?: string;
    [key: string]: string | undefined;
  };
  certifications?: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export type ProductCategory = 'Basmati' | 'Long Grain' | 'Medium Grain' | 'Short Grain' | 'Brown Rice' | 'Specialty'| 'Blended';

export interface ProductFilter {
  category?: ProductCategory;
  searchTerm?: string;
  certifications?: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}
