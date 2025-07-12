import { Injectable } from '@angular/core';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: {
    loc: string;
    title?: string;
    caption?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private baseUrl = 'https://nazricemills.com';
  private lastmod = new Date().toISOString().split('T')[0];

  constructor() {}

  /**
   * Generate sitemap XML content
   */
  generateSitemap(): string {
    const urls: SitemapUrl[] = [
      // Main pages
      {
        loc: '/',
        lastmod: this.lastmod,
        changefreq: 'weekly',
        priority: 1.0,
        images: [
          {
            loc: '/assets/img/farm2-slider-bg.jpg',
            title: 'Naz Rice Mills - Premium Quality Rice Products'
          }
        ]
      },
      {
        loc: '/about',
        lastmod: this.lastmod,
        changefreq: 'monthly',
        priority: 0.8,
        images: [
          {
            loc: '/assets/img/about-hero.jpeg',
            title: 'About Naz Rice Mills'
          }
        ]
      },
      {
        loc: '/products',
        lastmod: this.lastmod,
        changefreq: 'weekly',
        priority: 0.9,
        images: [
          {
            loc: '/assets/img/products/basmati-rice.jpg',
            title: 'Premium Basmati Rice'
          },
          {
            loc: '/assets/img/products/brown-basmati-rice.jpg',
            title: 'Brown Basmati Rice'
          }
        ]
      },
      {
        loc: '/contact',
        lastmod: this.lastmod,
        changefreq: 'monthly',
        priority: 0.7,
        images: [
          {
            loc: '/assets/img/contact-hero.jpeg',
            title: 'Contact Naz Rice Mills'
          }
        ]
      },
      {
        loc: '/live-process',
        lastmod: this.lastmod,
        changefreq: 'monthly',
        priority: 0.6,
        images: [
          {
            loc: '/assets/img/process-hero.jpeg',
            title: 'Rice Processing at Naz Rice Mills'
          }
        ]
      },
      // Legal pages
      {
        loc: '/privacy-policy',
        lastmod: this.lastmod,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: '/terms-of-service',
        lastmod: this.lastmod,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: '/cookie-policy',
        lastmod: this.lastmod,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];

    return this.buildSitemapXML(urls);
  }

  /**
   * Generate sitemap for products
   */
  generateProductSitemap(products: any[]): string {
    const urls: SitemapUrl[] = products.map(product => ({
      loc: `/products/${product.slug || product.id}`,
      lastmod: product.updated_at || this.lastmod,
      changefreq: 'weekly',
      priority: 0.8,
      images: product.images ? product.images.map((img: any) => ({
        loc: img.url,
        title: img.title || product.name,
        caption: img.caption || product.description
      })) : []
    }));

    return this.buildSitemapXML(urls);
  }

  /**
   * Build sitemap XML from URLs array
   */
  private buildSitemapXML(urls: SitemapUrl[]): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">`;

    const xmlFooter = `</urlset>`;

    const urlsXML = urls.map(url => this.buildUrlXML(url)).join('\n');

    return `${xmlHeader}\n${urlsXML}\n${xmlFooter}`;
  }

  /**
   * Build individual URL XML
   */
  private buildUrlXML(url: SitemapUrl): string {
    let xml = `  <url>
    <loc>${this.baseUrl}${url.loc}</loc>`;

    if (url.lastmod) {
      xml += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }

    if (url.changefreq) {
      xml += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }

    if (url.priority) {
      xml += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    }

    if (url.images && url.images.length > 0) {
      url.images.forEach(image => {
        xml += `\n    <image:image>
      <image:loc>${this.baseUrl}${image.loc}</image:loc>`;
        
        if (image.title) {
          xml += `\n      <image:title>${this.escapeXML(image.title)}</image:title>`;
        }
        
        if (image.caption) {
          xml += `\n      <image:caption>${this.escapeXML(image.caption)}</image:caption>`;
        }
        
        xml += `\n    </image:image>`;
      });
    }

    xml += `\n  </url>`;
    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  generateSitemapIndex(sitemaps: { name: string; lastmod: string }[]): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const xmlFooter = `</sitemapindex>`;

    const sitemapsXML = sitemaps.map(sitemap => `  <sitemap>
    <loc>${this.baseUrl}/${sitemap.name}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n');

    return `${xmlHeader}\n${sitemapsXML}\n${xmlFooter}`;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Disallow admin and private paths
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /_next/
Disallow: /cart
Disallow: /checkout
Disallow: /login
Disallow: /signup
Disallow: /my-orders

# Allow important files
Allow: /assets/
Allow: /sitemap.xml
Allow: /favicon.ico

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay (be respectful)
Crawl-delay: 1`;
  }
} 