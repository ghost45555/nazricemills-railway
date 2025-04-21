import { SiteConfig } from '../shared/interfaces/site-config.interface';

export const siteConfig: SiteConfig = {
  // Basic Site Information
  siteName: 'Naz Rice Mills',
  siteUrl: 'https://nazricemills.com',
  defaultImage: '/assets/img/farm2-slider-bg.jpg',
  defaultDescription: 'Premium quality rice products from Naz Rice Mills. Experience the finest selection of rice varieties crafted with generations of expertise.',
  defaultKeywords: [
    'premium rice',
    'basmati rice',
    'rice products',
    'rice mills',
    'quality rice',
    'rice supplier',
    'wholesale rice',
    'rice export',
    'organic rice',
    'traditional rice'
  ],

  // Social Media
  socialHandles: {
    twitter: '@nazricemills',
    facebook: 'nazricemills',
    instagram: 'nazricemills',
    linkedin: 'naz-rice-mills'
  },

  // Contact Information
  contact: {
    email: 'info@nazricemills.com',
    phone: '+1234567890',
    address: {
      street: '123 Rice Mill Road',
      city: 'Rice City',
      state: 'RC',
      country: 'Pakistan',
      postalCode: '123456'
    }
  },

  // Business Information
  businessHours: [
    { day: 'Monday', hours: '9:00 AM - 6:00 PM', isOpen: true },
    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
    { day: 'Thursday', hours: '9:00 AM - 6:00 PM', isOpen: true },
    { day: 'Friday', hours: '9:00 AM - 6:00 PM', isOpen: true },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM', isOpen: true },
    { day: 'Sunday', hours: 'Closed', isOpen: false }
  ],
  establishedYear: 1980,
  registrationNumber: 'RICE123456789',

  // SEO and Analytics
  googleAnalyticsId: 'G-XXXXXXXXXX',
  googleTagManagerId: 'GTM-XXXXXXX',
  microsoftClarityId: 'XXXXXXXX',
  facebookPixelId: 'XXXXXXXXXX',

  // Features Configuration
  features: {
    darkMode: true,
    multilingual: false,
    ecommerce: false,
    blog: false,
    newsletter: true,
    chat: true
  },

  // API Endpoints
  apiEndpoints: {
    base: 'https://api.nazricemills.com',
    products: '/products',
    contact: '/contact',
    newsletter: '/newsletter',
    chat: '/chat'
  },

  // External Services
  services: {
    mapApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    recaptchaSiteKey: 'YOUR_RECAPTCHA_SITE_KEY',
    chatbotId: 'YOUR_CHATBOT_ID',
    paymentGateway: {
      provider: 'stripe',
      publicKey: 'YOUR_STRIPE_PUBLIC_KEY'
    }
  },

  // Legal Information
  legal: {
    companyName: 'Naz Rice Mills Pvt. Ltd.',
    vatNumber: 'VAT123456789',
    privacyPolicyUrl: '/privacy-policy',
    termsOfServiceUrl: '/terms-of-service',
    cookiePolicyUrl: '/cookie-policy'
  },

  // Performance Settings
  performance: {
    imageLazyLoading: true,
    preloadComponents: [
      'HeroSection',
      'ProductsSection',
      'AboutSection'
    ],
    cacheTimeout: 3600, // 1 hour in seconds
    apiTimeout: 30000 // 30 seconds in milliseconds
  },

  // Content Delivery
  cdn: {
    baseUrl: 'https://cdn.nazricemills.com',
    imageUrl: 'https://cdn.nazricemills.com/images',
    videoUrl: 'https://cdn.nazricemills.com/videos',
    documentUrl: 'https://cdn.nazricemills.com/documents'
  }
};
