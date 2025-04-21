import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface SiteConfig {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  socialHandles: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
}

interface MetaConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  noindex?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly defaultDescription = 'Premium quality rice products from Naz Rice Mills. Experience the finest selection of rice varieties crafted with generations of expertise.';
  private readonly defaultKeywords = ['rice', 'rice mills', 'premium rice', 'basmati rice', 'rice products'];

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject('SITE_CONFIG') private siteConfig: SiteConfig
  ) {
    // Update meta tags on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateMetaForCurrentRoute();
    });
  }

  /**
   * Update all meta tags for the current route
   */
  private updateMetaForCurrentRoute(): void {
    const route = this.router.routerState.snapshot.root;
    let metaConfig = this.getMetaConfigForRoute(route.data);

    // If no specific meta config is found, use defaults
    if (!metaConfig) {
      metaConfig = this.getDefaultMetaConfig();
    }

    this.updateMeta(metaConfig);
  }

  /**
   * Update meta tags with provided configuration
   */
  updateMeta(config: MetaConfig): void {
    // Basic meta tags
    this.title.setTitle(`${config.title} | ${this.siteConfig.siteName}`);
    this.meta.updateTag({ name: 'description', content: config.description });
    
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    }

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: config.ogTitle || config.title });
    this.meta.updateTag({ property: 'og:description', content: config.ogDescription || config.description });
    this.meta.updateTag({ property: 'og:image', content: this.getAbsoluteUrl(config.ogImage || this.siteConfig.defaultImage) });
    this.meta.updateTag({ property: 'og:url', content: config.ogUrl || window.location.href });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteConfig.siteName });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: config.twitterCard || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: config.twitterSite || this.siteConfig.socialHandles.twitter });
    this.meta.updateTag({ name: 'twitter:creator', content: config.twitterCreator || this.siteConfig.socialHandles.twitter });
    this.meta.updateTag({ name: 'twitter:title', content: config.ogTitle || config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.ogDescription || config.description });
    this.meta.updateTag({ name: 'twitter:image', content: this.getAbsoluteUrl(config.ogImage || this.siteConfig.defaultImage) });

    // Social Media tags
    this.meta.updateTag({ property: 'fb:pages', content: this.siteConfig.socialHandles.facebook });
    this.meta.updateTag({ property: 'instagram:creator', content: this.siteConfig.socialHandles.instagram });
    this.meta.updateTag({ property: 'linkedin:author', content: this.siteConfig.socialHandles.linkedin });

    // Canonical URL
    const link: HTMLLinkElement = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', config.canonical || window.location.href);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(link);
    }

    // Robots meta tag
    if (config.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  /**
   * Get meta configuration for a specific route
   */
  private getMetaConfigForRoute(data: any): MetaConfig | null {
    if (data && data.meta) {
      return data.meta;
    }
    return null;
  }

  /**
   * Get default meta configuration
   */
  private getDefaultMetaConfig(): MetaConfig {
    return {
      title: this.siteConfig.siteName,
      description: this.defaultDescription,
      keywords: this.defaultKeywords,
      ogImage: this.siteConfig.defaultImage,
      twitterCard: 'summary_large_image',
      twitterSite: this.siteConfig.socialHandles.twitter
    };
  }

  /**
   * Update meta tags for a specific section
   */
  updateSection(section: string, config: Partial<MetaConfig>): void {
    const defaultConfig = this.getDefaultMetaConfig();
    this.updateMeta({
      ...defaultConfig,
      ...config,
      title: `${config.title || section} | ${this.siteConfig.siteName}`
    });
  }

  /**
   * Reset meta tags to default values
   */
  resetToDefault(): void {
    this.updateMeta(this.getDefaultMetaConfig());
  }

  /**
   * Convert relative URL to absolute URL
   */
  private getAbsoluteUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.siteConfig.siteUrl}${url}`;
  }
}
