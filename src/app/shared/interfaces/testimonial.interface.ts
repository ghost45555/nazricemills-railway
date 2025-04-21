export interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  location?: string;
  date?: string;
  featured?: boolean;
  tags?: string[];
  socialProof?: {
    platform: 'google' | 'facebook' | 'linkedin' | 'other';
    link?: string;
    verified?: boolean;
  };
}

export interface TestimonialFilter {
  rating?: number;
  featured?: boolean;
  tags?: string[];
  platform?: 'google' | 'facebook' | 'linkedin' | 'other';
  verified?: boolean;
}

export interface TestimonialStats {
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  platformDistribution: {
    [key: string]: number;
  };
  verifiedCount: number;
}
