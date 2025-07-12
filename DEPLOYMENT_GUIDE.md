# Firebase App Hosting Deployment Guide - Angular 19 SSR

## Overview

This guide covers deploying the Naz Rice Mills website to Firebase App Hosting with Angular 19 Server-Side Rendering (SSR) capabilities.

## Prerequisites

- Firebase CLI installed and configured
- Node.js 20+ installed
- Angular CLI 19+ installed
- Firebase project set up

## Project Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
firebase init
```

Select:
- App Hosting
- Functions (optional)
- Hosting (as fallback)

## Build Configuration

### 1. Angular 19 Features Enabled

✅ **Incremental Hydration**: Components hydrate on-demand
✅ **Event Replay**: User events are captured and replayed
✅ **Hot Module Replacement**: Fast development with HMR
✅ **Improved SSR**: Better server-side rendering performance

### 2. Build Commands

```bash
# Development build
npm run build

# Production build
npm run build --configuration=production

# SSR build (for App Hosting)
npm run build:ssr

# Serve SSR locally
npm run serve:ssr
```

## Firebase App Hosting Configuration

### 1. apphosting.yaml

```yaml
# Firebase App Hosting configuration for Angular 19 SSR
runConfig:
  minInstances: 0
  maxInstances: 100
  concurrency: 80
  cpu: 1
  memoryMiB: 1024
  timeoutSeconds: 300

# Build configuration
build:
  commands:
    - npm ci
    - npm run build:ssr
  outputDir: dist/ricemill

# Environment variables
env:
  - variable: NODE_ENV
    value: production
    availability:
      - RUNTIME
  
  - variable: SITE_URL
    value: https://nazricemills.com
    availability:
      - BUILD
      - RUNTIME
  
  - variable: GA_TRACKING_ID
    value: G-XXXXXXXXXX
    availability:
      - BUILD
      - RUNTIME
```

### 2. Firebase Configuration

```json
{
  "hosting": {
    "public": "dist/ricemill/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|map)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

## Deployment Steps

### 1. Deploy to Firebase App Hosting

```bash
# Deploy to App Hosting
firebase deploy --only apphosting

# Or deploy everything
firebase deploy
```

### 2. Custom Domain Setup

1. Go to Firebase Console > App Hosting
2. Click "Add custom domain"
3. Enter: nazricemills.com
4. Follow DNS verification steps
5. Update DNS records as instructed

### 3. SSL Configuration

Firebase App Hosting automatically provides SSL certificates for custom domains.

## SEO Optimization

### 1. Meta Tags & Open Graph

✅ Dynamic meta tags for each page
✅ Open Graph tags for social sharing
✅ Twitter Card integration
✅ Canonical URLs

### 2. Structured Data

✅ Organization schema
✅ Product schema
✅ Local business schema
✅ FAQ schema
✅ Breadcrumb schema

### 3. Sitemap & Robots

✅ Dynamic sitemap generation
✅ Image sitemaps
✅ Robots.txt optimization

## Performance Optimizations

### 1. Core Web Vitals

- **LCP**: < 2.5s with SSR
- **FID**: < 100ms with event replay
- **CLS**: < 0.1 with proper layout

### 2. Caching Strategy

```
Static Assets: 1 year cache
HTML Pages: 1 hour cache
API Data: 24 hours cache
Images: 1 year cache
```

### 3. Bundle Optimization

```
Initial Bundle: ~197KB (gzipped)
Lazy Chunks: Route-based splitting
Tree Shaking: Enabled
Dead Code Elimination: Enabled
```

## Analytics & Monitoring

### 1. Google Analytics 4

```typescript
// GA4 Configuration
const gaConfig = {
  trackingId: 'G-XXXXXXXXXX',
  anonymizeIp: true,
  cookieDomain: 'nazricemills.com'
};
```

### 2. Google Search Console

1. Add property: nazricemills.com
2. Verify ownership via HTML file
3. Submit sitemap: https://nazricemills.com/sitemap.xml

### 3. Performance Monitoring

```typescript
// Performance tracking
trackTiming('page_load', 'initial_render', loadTime);
trackEvent('page_view', 'home', { page_path: '/' });
```

## Testing & Validation

### 1. SEO Testing

```bash
# Check structured data
curl -s "https://nazricemills.com" | grep -o 'application/ld+json'

# Test robots.txt
curl https://nazricemills.com/robots.txt

# Test sitemap
curl https://nazricemills.com/sitemap.xml
```

### 2. Performance Testing

```bash
# Lighthouse CI
npx lighthouse https://nazricemills.com --output=json

# PageSpeed Insights
https://pagespeed.web.dev/analysis?url=https://nazricemills.com
```

### 3. SSR Validation

```bash
# Check server-side rendering
curl -s "https://nazricemills.com" | grep -i "naz rice mills"

# Test hydration
curl -s "https://nazricemills.com" | grep -i "ng-hydration"
```

## Troubleshooting

### 1. Common Issues

**Build Errors**
```bash
# Clear cache
rm -rf .angular/cache
npm run build

# Update dependencies
ng update
```

**SSR Issues**
```bash
# Check server logs
firebase functions:log --only apphosting

# Test locally
npm run serve:ssr
```

**Performance Issues**
```bash
# Bundle analysis
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/ricemill/stats.json
```

### 2. Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Check deployment status
firebase deploy --dry-run

# View logs
firebase functions:log
```

## Environment Variables

### Production Environment

```bash
# Update tracking ID
firebase functions:config:set analytics.tracking_id="G-XXXXXXXXXX"

# Update site URL
firebase functions:config:set site.url="https://nazricemills.com"
```

### Development Environment

```bash
# Local development
export NODE_ENV=development
export SITE_URL=http://localhost:4200
export GA_TRACKING_ID=G-XXXXXXXXXX
```

## Monitoring & Maintenance

### 1. Regular Checks

- Monthly Google Search Console review
- Weekly performance monitoring
- Daily error log review

### 2. Updates

- Monthly Angular updates
- Quarterly dependency updates
- Annual Firebase plan review

### 3. Backup Strategy

```bash
# Export Firebase project
firebase projects:addfirebase <project-id>

# Backup configuration
git commit -am "Backup Firebase config"
```

## Support & Resources

### Documentation

- [Angular 19 SSR Guide](https://angular.io/guide/ssr)
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Angular Universal](https://angular.io/guide/universal)

### Community

- [Angular Discord](https://discord.gg/angular)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/angular)

## Conclusion

The website is now deployed with:
- ✅ Angular 19 with SSR
- ✅ Firebase App Hosting
- ✅ Comprehensive SEO optimization
- ✅ Performance monitoring
- ✅ Analytics integration

The setup provides excellent SEO performance, fast loading times, and scalable hosting for the Naz Rice Mills website. 