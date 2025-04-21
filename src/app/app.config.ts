import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { errorHandlingInterceptor } from './interceptors/error-handling.interceptor';
import { ErrorHandlerService } from './services/error-handler.service';
import { AnalyticsConfig } from './shared/interfaces/analytics.interface';
import { LoadingService } from './services/loading.service';

const analyticsConfig: AnalyticsConfig = {
  enablePageViews: true,
  enableUserInteractions: true,
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  sampleRate: 100,
  excludePaths: ['/private', '/admin'],
  sessionTimeout: 30
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([errorHandlingInterceptor])),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: 'ANALYTICS_CONFIG', useValue: analyticsConfig },
    { 
      provide: 'SITE_CONFIG', 
      useValue: {
        siteName: 'Naz Rice Mills',
        siteUrl: 'https://nazricemills.com',
        defaultImage: '/assets/img/farm2-slider-bg.jpg',
        socialHandles: {
          twitter: '@nazricemills',
          facebook: 'nazricemills',
          instagram: 'nazricemills',
          linkedin: 'naz-rice-mills'
        }
      }
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    LoadingService
  ]
};
