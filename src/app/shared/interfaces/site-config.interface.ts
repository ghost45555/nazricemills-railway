export interface SocialHandles {
  twitter: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface SiteConfig {
  // Basic Site Information
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  defaultDescription: string;
  defaultKeywords: string[];

  // Social Media
  socialHandles: SocialHandles;

  // Contact Information
  contact: ContactInfo;

  // Business Information
  businessHours: BusinessHours[];
  establishedYear: number;
  registrationNumber?: string;

  // SEO and Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  microsoftClarityId?: string;
  facebookPixelId?: string;

  // Features Configuration
  features: {
    darkMode: boolean;
    multilingual: boolean;
    ecommerce: boolean;
    blog: boolean;
    newsletter: boolean;
    chat: boolean;
  };

  // API Endpoints
  apiEndpoints: {
    base: string;
    products: string;
    contact: string;
    newsletter: string;
    chat: string;
  };

  // External Services
  services: {
    mapApiKey?: string;
    recaptchaSiteKey?: string;
    chatbotId?: string;
    paymentGateway?: {
      provider: string;
      publicKey: string;
    };
  };

  // Legal Information
  legal: {
    companyName: string;
    vatNumber?: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
    cookiePolicyUrl: string;
  };

  // Performance Settings
  performance: {
    imageLazyLoading: boolean;
    preloadComponents: string[];
    cacheTimeout: number;
    apiTimeout: number;
  };

  // Content Delivery
  cdn: {
    baseUrl: string;
    imageUrl: string;
    videoUrl: string;
    documentUrl: string;
  };
}
