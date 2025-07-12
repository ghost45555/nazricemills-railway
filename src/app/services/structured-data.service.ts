import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    '@type': string;
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
  foundingDate: string;
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
}

interface ProductSchema {
  '@context': string;
  '@type': string;
  name: string;
  image: string[];
  description: string;
  sku: string;
  brand: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    validFrom: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  private readonly baseUrl = 'https://nazricemills.com';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Add organization schema to the page
   */
  addOrganizationSchema(): void {
    const schema: OrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Naz Rice Mills',
      url: this.baseUrl,
      logo: `${this.baseUrl}/assets/img/Logo.png`,
      description: 'Premium quality rice products from Naz Rice Mills. Experience the finest selection of rice varieties crafted with generations of expertise.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Rice Mill Road',
        addressLocality: 'Rice City',
        addressRegion: 'Punjab',
        postalCode: '123456',
        addressCountry: 'Pakistan'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+92-123-456-7890',
        contactType: 'customer service',
        email: 'info@nazricemills.com'
      },
      sameAs: [
        'https://twitter.com/nazricemills',
        'https://facebook.com/nazricemills',
        'https://instagram.com/nazricemills',
        'https://linkedin.com/company/naz-rice-mills'
      ],
      foundingDate: '1980-01-01',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 150
      }
    };

    this.addStructuredData(schema, 'organization-schema');
  }

  /**
   * Add product schema for individual products
   */
  addProductSchema(product: {
    name: string;
    description: string;
    image: string[];
    sku: string;
    price: string;
    currency: string;
    availability: string;
    rating?: number;
    reviewCount?: number;
  }): void {
    const schema: ProductSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image.map(img => `${this.baseUrl}${img}`),
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: 'Naz Rice Mills'
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        validFrom: new Date().toISOString()
      }
    };

    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      };
    }

    this.addStructuredData(schema, 'product-schema');
  }

  /**
   * Add breadcrumb schema for navigation
   */
  addBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): void {
    const schema: BreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.baseUrl}${item.url}`
      }))
    };

    this.addStructuredData(schema, 'breadcrumb-schema');
  }

  /**
   * Add FAQ schema for frequently asked questions
   */
  addFAQSchema(faqs: Array<{ question: string; answer: string }>): void {
    const schema: FAQSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    this.addStructuredData(schema, 'faq-schema');
  }

  /**
   * Add local business schema
   */
  addLocalBusinessSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Naz Rice Mills',
      image: `${this.baseUrl}/assets/img/Logo.png`,
      telephone: '+92-123-456-7890',
      email: 'info@nazricemills.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Rice Mill Road',
        addressLocality: 'Rice City',
        addressRegion: 'Punjab',
        postalCode: '123456',
        addressCountry: 'Pakistan'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 31.5204,
        longitude: 74.3587
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '10:00',
          closes: '16:00'
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 150
      }
    };

    this.addStructuredData(schema, 'local-business-schema');
  }

  /**
   * Add website schema
   */
  addWebsiteSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Naz Rice Mills',
      url: this.baseUrl,
      description: 'Premium quality rice products from Naz Rice Mills. Experience the finest selection of rice varieties crafted with generations of expertise.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    this.addStructuredData(schema, 'website-schema');
  }

  /**
   * Remove specific structured data
   */
  removeStructuredData(id: string): void {
    const element = this.document.getElementById(id);
    if (element) {
      element.remove();
    }
  }

  /**
   * Remove all structured data
   */
  removeAllStructuredData(): void {
    const elements = this.document.querySelectorAll('script[type="application/ld+json"]');
    elements.forEach(element => element.remove());
  }

  /**
   * Generic method to add structured data to the page
   */
  private addStructuredData(schema: any, id: string): void {
    // Remove existing schema with same ID
    this.removeStructuredData(id);

    // Create new script element
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(schema, null, 2);

    // Add to document head
    this.document.head.appendChild(script);
  }
} 